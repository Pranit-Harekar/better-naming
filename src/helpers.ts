import { OutputChannel } from 'vscode'

export function printChannelOutput(
  outputChannel: OutputChannel,
  content: string,
  reveal = false,
) {
  outputChannel.appendLine(content)
  if (reveal) {
    outputChannel.show(true)
  }
}

export function parseResult(text: string) {
  return text.match(/([a-zA-Z]+|\"[a-zA-Z\s]+\")/g) || []
}
