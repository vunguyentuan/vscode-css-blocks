import { CompletionItem, CompletionItemKind, Position, TextDocument, CompletionItemProvider } from 'vscode';

import {
  findImportPath,
  getSuggestions,
  SuggestionType,
} from './utils';

const path = require('path');

// check if current character or last character is .
function isTrigger(line: string, position: Position) {
  const i = position.character - 1;
  return line[i] === '.' || (i > 1 && line[i - 1] === '.');
}

function getWords(line: string, position: Position) {
  const text = line.slice(0, position.character);
  const index = text.search(/[a-zA-Z0-9\._]*$/);
  if (index === -1) {
    return '';
  }

  return text.slice(index);
}

export default class CSSBlocksCompletionProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position) : Thenable<CompletionItem[]> {
    const lineText = document.lineAt(position.line).text;
    const currentDir = path.dirname(document.uri.fsPath);

    const empty = Promise.resolve([]);

    if (!isTrigger(lineText, position)) {
      return empty;
    }

    const words = getWords(lineText, position);

    if (words === '' || words.indexOf('.') === -1) {
      return empty;
    }

    const [obj, ...fields] = words.split('.');
    const field = fields.join('[state|');

    const importPath = findImportPath(document.getText(), obj, currentDir);
    if (importPath === '') {
      return empty;
    }

    const suggestions = getSuggestions(importPath, field);

    return Promise.resolve(
      suggestions.map(({ name, type }) => {
        if (type === SuggestionType.Method) {
          return new CompletionItem(name, CompletionItemKind.Method);
        }

        return new CompletionItem(name, CompletionItemKind.Variable);
      })
    );
  }
}
