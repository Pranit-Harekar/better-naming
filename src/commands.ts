import { Configuration, OpenAIApi } from 'openai'
import {
  ExtensionContext,
  OutputChannel,
  Range,
  SecretStorage,
  window,
} from 'vscode'
import { parseResult, printChannelOutput } from './helpers'

const numberOfSuggestions = 3
const OPENAI_API_KEY = 'OPENAI_API_KEY'

// store previous input to avoid repeating variable names
let previousInput = ''

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
  let apiKey: string | undefined

  try {
    // get api key from secrets
    const secrets: SecretStorage = context.secrets
    apiKey = await secrets.get(OPENAI_API_KEY)

    // if no api key, prompt user for it
    if (!apiKey) {
      apiKey = await setApiKey(context, outputChannel)
    }

    if (!apiKey) {
      throw new Error("BetterNaming: Couldn't get api key")
    }
  } catch (error) {
    console.error(error)
    window.showInformationMessage(`BetterNaming: Set your OpenAI API key`)
    return
  }

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
    window.showInformationMessage(
      `BetterNaming: Select code to generate variable names`,
    )
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
      n: numberOfSuggestions,
      prompt,
    })

    // show result
    const result = completion.data.choices[0].text

    if (!result) {
      window.showInformationMessage(
        `BetterNaming: No suggestions found. Please try again.`,
      )
      return
    }

    const parsedResult = parseResult(result)
    printChannelOutput(outputChannel, `BetterNaming: ${parsedResult}`, true)

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
  } catch (error) {
    window.showErrorMessage(
      `BetterNaming: Something went wrong, please retry command`,
    )
    console.error(error)
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
    const secrets: SecretStorage = context.secrets
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
        'You can get your API key from https://beta.openai.com/account/api-keys',
      ignoreFocusOut: true,
      validateInput,
    })

    if (!apiKey) {
      throw new Error("BetterNaming: Couldn't get api key")
    }

    // store api key in secrets
    await secrets.store(OPENAI_API_KEY, apiKey)
    printChannelOutput(outputChannel, `BetterNaming: Logged in`, true)

    return apiKey
  } catch (error) {
    console.error('BetterNaming: Error setting api key', error)
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
    const secrets: SecretStorage = context.secrets
    await secrets.delete(OPENAI_API_KEY)
    printChannelOutput(outputChannel, `BetterNaming: Logged out`, true)
  } catch (error) {
    console.error(error)
  }
}
