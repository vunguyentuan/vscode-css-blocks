import * as path from "path";
import { CompletionItem, CompletionItemProvider, Position, TextDocument } from "vscode";

import {
  findImportPath,
  getSuggestionKeyword,
  getSuggestions,
  shouldShowCompletion,
} from "./utils";

export class CSSBlocksCompletionProvider implements CompletionItemProvider {
  async provideCompletionItems(document: TextDocument, position: Position): Promise<CompletionItem[]> {
    const lineText = document.lineAt(position.line).text;
    const currentDir = path.dirname(document.uri.fsPath);

    const empty = Promise.resolve([]);

    if (!shouldShowCompletion(lineText, position)) {
      return empty;
    }

    const words = getSuggestionKeyword(lineText, position);

    if (words === "" || words.indexOf(".") === -1) {
      return empty;
    }

    const [obj, ...field] = words.split(".");

    const importPath = findImportPath(document.getText(), obj, currentDir);

    // stop when no import statements
    if (!importPath) {
      return empty;
    }

    return getSuggestions(importPath, field);
  }
}
