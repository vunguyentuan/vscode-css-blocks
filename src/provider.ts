import { CompletionItem, Position, TextDocument, CompletionItemProvider } from 'vscode';

import {
  findImportPath,
  getSuggestions,
  shouldShowCompletion,
  getSuggestionKeyword
} from './utils';

import * as path from 'path';

export default class CSSBlocksCompletionProvider implements CompletionItemProvider {
  async provideCompletionItems(document: TextDocument, position: Position) : Promise<CompletionItem[]> {
    const lineText = document.lineAt(position.line).text;
    const currentDir = path.dirname(document.uri.fsPath);

    const empty = Promise.resolve([]);

    if (!shouldShowCompletion(lineText, position)) {
      return empty;
    }

    const words = getSuggestionKeyword(lineText, position);

    if (words === '' || words.indexOf('.') === -1) {
      return empty;
    }

    const [obj, ...field] = words.split('.');

    const importPath = findImportPath(document.getText(), obj, currentDir);

    // stop when no import statements
    if (!importPath) {
      return empty;
    }

    return getSuggestions(importPath, field);
  }
}
