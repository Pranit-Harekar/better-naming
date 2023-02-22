[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

# BetterNaming - VS Code Extension

> A genie in a bottle, ready to grant developers' wishes for well-named variables

This extension suggests meaningful names for variables, functions and classes
using the OpenAI's text completions API.

[Extension Link](https://marketplace.visualstudio.com/items?itemName=pranit-harekar.BetterNaming)

https://user-images.githubusercontent.com/17886017/219983224-cafde37d-99b7-4f32-87e9-69c322514617.mov

## Requirements

This extension uses OpenAI's [Node.js library](https://github.com/openai/openai-node) to access their [Text Completion API](https://platform.openai.com/docs/guides/completion/text-completion) therefore it needs to be configured with your account's secret key, which is available on the [website](https://beta.openai.com/account/api-keys). Once you obtain it, you can either run `setApiKey`
command explicitly or `suggestNames` directly to set the API key. This is a one time setup as your API key will be stored in a [SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage). Therefore the key is persisted across reloads and is independent of the current opened workspace.

## Features

Extension currently offers following commands, which can be access via Command Palette (Cmd+Shift+P) -

- `suggestNames`: Suggests names. Select a code block and run the command to view suggestions. Additionally, if your code has "foo" as the placeholder name, it will be renamed with your selection from the suggestion list otherwise
  extension will not rename it.

- `setApiKey`: Sets secret API key. As mentioned above, this command can be skipped if you run `suggestNames`, in which case this command will be run as a part of `suggestNames` command if the API key is missing.

- `deleteApiKey`: Deletes secret API key

## Release Notes

### 1.0.0

Initial release

--
