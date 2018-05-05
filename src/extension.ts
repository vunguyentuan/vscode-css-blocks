
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import CSSBlockProvider from './provider';
import CSSBlockDefinitionProvider from './definition';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context: vscode.ExtensionContext) {
  const mode = [
    { language: 'typescriptreact', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' }
  ];

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      mode,
      new CSSBlockProvider(),
      '.'
    )
  );
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      mode,
      new CSSBlockDefinitionProvider()
    )
  );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
