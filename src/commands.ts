import { Configuration, OpenAIApi } from 'openai'
import { ExtensionContext, OutputChannel, Range, window } from 'vscode'

import { handleError, parseResult, printOutput, showPopup } from './helpers'

const numberOfCompletions = 3
const OPENAI_API_KEY = 'OPENAI_API_KEY'

// store previous input to avoid repeating variable names
let previousInput = ''

/**
 * Gets api key from secrets or prompts user for it
 * @param context
 * @param outputChannel
 * @returns
 */
async function getApiKey(
  context: ExtensionContext,
  outputChannel: OutputChannel,
) {
  // get api key from secrets
  const secrets = context.secrets
  let apiKey = await secrets.get(OPENAI_API_KEY)

  // if no api key, prompt user for it
  if (!apiKey) {
    apiKey = await setApiKey(context, outputChannel)
  }

  if (!apiKey) {
    throw new Error("Couldn't get API key")
  }

  return apiKey
}

/**
 * Suggests names for a given code selection
 * @param context
 * @param outputChannel
 * @returns
 */
export async function suggestNames(
  context: ExtensionContext,
  outputChannel: OutputChannel,
) {
  let apiKey = await getApiKey(context, outputChannel)

  // create openai api client
  const configuration = new Configuration({
    apiKey,
  })
  const openai = new OpenAIApi(configuration)

  // get highlighted text
  let editor = window.activeTextEditor
  let selection = editor?.selection

  // if no text is highlighted, prompt user to highlight text
  if (!editor || !selection || selection.isEmpty) {
    showPopup('Select code to generate names')
    return
  }

  const selectionRange = new Range(selection.start, selection.end)
  const input = editor.document.getText(selectionRange)

  try {
    const prompt =
      previousInput === input
        ? `Suggest a few more names for this code block and give me a comma separated list - ${input}`
        : `Suggest names for this code block and give me a comma separated list - ${input}`

    // call openai api
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      n: numberOfCompletions,
      prompt,
    })

    // show result
    const result = completion.data.choices[0].text

    if (!result) {
      showPopup('No suggestions found. Please try again.')
      return
    }

    const parsedResult = parseResult(result)
    printOutput(outputChannel, parsedResult)

    window.showQuickPick(parsedResult, {
      onDidSelectItem: (item) => {
        if (typeof item === 'string') {
          editor?.edit((editBuilder) => {
            const updatedSelection = input.replace(/(foo|Foo)/, item)
            editBuilder.replace(selectionRange, updatedSelection)
          })
        }
      },
    })
  } catch (error: any) {
    let defaultMessage = 'Something went wrong, please retry command'
    handleError(defaultMessage, error, outputChannel)
  }

  previousInput = input
}

/**
 * Prompts user for OpenAI secret API key and stores it
 * @param context
 * @param outputChannel
 * @returns
 */
export async function setApiKey(
  context: ExtensionContext,
  outputChannel: OutputChannel,
) {
  try {
    const secrets = context.secrets
    const validateInput = (value: string) => {
      if (!value || value.length === 0) {
        return 'Please enter your OpenAI secret API key'
      }
      return null
    }

    // prompt user for api key
    const apiKey = await window.showInputBox({
      title: 'Enter you OpenAI secret API key',
      placeHolder: 'Enter you OpenAI secret API key',
      prompt:
        'You can get your API key from https://platform.openai.com/account/api-keys',
      ignoreFocusOut: true,
      validateInput,
    })

    if (!apiKey) {
      throw new Error('No api key provided')
    }

    // store api key in secrets
    await secrets.store(OPENAI_API_KEY, apiKey)
    printOutput(outputChannel, '💾 Stored api key')

    return apiKey
  } catch (error) {
    let defaultMessage = 'Error setting api key'
    handleError(defaultMessage, error, outputChannel)
  }
}

/**
 * Deletes OpenAI secret API key from secrets
 * @param context
 * @param outputChannel
 */
export async function deleteApiKey(
  context: ExtensionContext,
  outputChannel: OutputChannel,
) {
  try {
    const secrets = context.secrets
    await secrets.delete(OPENAI_API_KEY)
    printOutput(outputChannel, '🗑️ Deleted api key')
  } catch (error) {
    let defaultMessage = 'Error deleting api key'
    handleError(defaultMessage, error, outputChannel)
  }
}
