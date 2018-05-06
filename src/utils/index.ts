import * as path from "path";
import { Position } from "vscode";

import * as BlockHelper from "./block-helper";

export function getSuggestionKeyword(line: string, position: Position) {
  const text = line.slice(0, position.character);
  const index = text.search(/[a-zA-Z0-9\._]*$/);
  if (index === -1) {
    return "";
  }

  return text.slice(index);
}

export function getDefinitionKeyword(line: string, position: Position) {
  const headText = line.slice(0, position.character);
  const startIndex = headText.search(/[a-zA-Z0-9\._]*$/);

  // not found or not clicking object field
  if (startIndex === -1 || headText.slice(startIndex).indexOf(".") === -1) {
    return "";
  }

  const match = /^([a-zA-Z0-9\._]*)/.exec(line.slice(startIndex));
  if (match === null) {
    return "";
  }

  const fullMatch = match[1];

  // "styles.icon.animate".slice(0, 35 - 25)
  // styles.ico

  const fullParts = fullMatch.split(".");
  const parts = fullMatch.slice(0, position.character - startIndex).split(".");

  return parts.map((part, index) => fullParts[index]).join(".");
}

// check if current character or last character is .
export function shouldShowCompletion(line: string, position: Position) {
  const i = position.character - 1;
  return line[i] === "." || (i > 1 && line[i - 1] === ".");
}

export function generateImportRegex(key: string) {
  const pattern = `${key}\\s+(?:from\\s+|=\\s+require(?:<any>)?\\()["'](.+\\.\\S{1,2}ss)["']\\)?`;
  return new RegExp(pattern);
}

export function findImportPath(sourceText: string, key: string, parentPath: string) {
  const re = generateImportRegex(key);
  const importStatements = re.exec(sourceText);

  if (!importStatements) {
    return;
  }

  return path.resolve(parentPath, importStatements[1]);
}

export async function getSuggestions(filePath: string, keyword: Array<string>) {
  const block = await BlockHelper.parse(filePath);

  return BlockHelper.getSuggestions(block, keyword);
}

export async function getDefinitionPositionByKeyword(filePath: string, fields: Array<string>) {
  const block = await BlockHelper.parse(filePath);

  return BlockHelper.getPositionByKeyword(block, fields);
}
