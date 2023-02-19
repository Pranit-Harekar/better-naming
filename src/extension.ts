import { commands, ExtensionContext, OutputChannel, window } from 'vscode'

import { deleteApiKey, suggestNames, setApiKey } from './commands'

let outputChannel: OutputChannel

export function activate(context: ExtensionContext) {
  outputChannel = window.createOutputChannel('betterNaming')

  let suggestNamesDisposable = commands.registerCommand(
    'betterNaming.suggestNames',
    () => {
      suggestNames(context, outputChannel)
    },
  )

  let setApiKeyDisposable = commands.registerCommand(
    'betterNaming.setApiKey',
    () => {
      setApiKey(context, outputChannel)
    },
  )

  let deleteApiKeyDisposable = commands.registerCommand(
    'betterNaming.deleteApiKey',
    () => {
      deleteApiKey(context, outputChannel)
    },
  )

  context.subscriptions.push(
    suggestNamesDisposable,
    setApiKeyDisposable,
    deleteApiKeyDisposable,
  )
}

export function deactivate() {}
