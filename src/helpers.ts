import { OutputChannel, window } from 'vscode'

export function printOutput(
  outputChannel: OutputChannel,
  content: unknown,
  reveal = true,
) {
  outputChannel.appendLine(`BetterNaming: ${content}`)
  if (reveal) {
    outputChannel.show(true)
  }
}

export function parseResult(text: string) {
  return text.match(/([a-zA-Z]+|\"[a-zA-Z\s]+\")/g) || []
}

export function showPopup(
  message: string,
  type: 'info' | 'error' | 'warning' = 'info',
) {
  const formattedMessage = `BetterNaming: ${message}`
  switch (type) {
    case 'info':
      window.showInformationMessage(formattedMessage)
      break
    case 'error':
      window.showErrorMessage(formattedMessage)
      break
    case 'warning':
      window.showWarningMessage(formattedMessage)
      break
  }
}

export function handleError(
  defaultMessage: string,
  error: unknown,
  outputChannel: OutputChannel,
) {
  let userFriendlyErrorMessage = defaultMessage
  const debugData = JSON.stringify(error)

  if (error instanceof Error) {
    userFriendlyErrorMessage = error.message
  }

  showPopup(userFriendlyErrorMessage, 'error')
  printOutput(outputChannel, userFriendlyErrorMessage)

  const detailedErrorMessage = `${userFriendlyErrorMessage}, ${debugData}`
  console.error(detailedErrorMessage)
}
