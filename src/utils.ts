import { Position, TextDocument } from "vscode";
import * as path from 'path';
import * as fs from 'fs';
import * as _ from "lodash";

export function getCurrentLine(document: TextDocument, position: Position) {
  return document.getText(document.lineAt(position).range);
}

export function genImportRegExp(key: string) {
  const file = '(.+\\.\\S{1,2}ss)';
  const fromOrRequire = '(?:from\\s+|=\\s+require(?:<any>)?\\()';
  const requireEndOptional = '\\)?';
  const pattern = `${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
  return new RegExp(pattern);
}

export function findImportPath(text: string, key: string, parentPath: string) {
  const re = genImportRegExp(key);
  const results = re.exec(text);
  if (!!results && results.length > 0) {
    return path.resolve(parentPath, results[1]);
  } else {
    return '';
  }
}

export enum SuggestionType {
  Class,
  Method
}

type Suggestion = {
  type: SuggestionType,
  name: string,
  parent: string,
  searchText: string
};

export function getSuggestions(filePath: string, keyword: string) : Array<Suggestion> {
  if (!keyword) {
    keyword = ':scope';
  }

  const content = fs.readFileSync(filePath, { encoding: 'utf8' });
  const lines = content.match(/.*[,{]/g);
  if (lines === null) {
    return [];
  }

  const methodRegex = /[.|:]\w+\[state\|[A-Za-z]\w+/g;
  const classNameRegex = /\.[_A-Za-z0-9\-]+/g;

  const selector = lines.join(' ');
  const classNames = selector.match(classNameRegex);
  const methods = selector.match(methodRegex);

  const suggestions: Array<Suggestion> = [];

  if (classNames !== null) {
    const uniqueClassNames = _.uniq(classNames).map((item: string) => {
      const subclassName = item.slice(1);
      const parent = ':scope';
      return {
        type: SuggestionType.Class,
        name: subclassName,
        parent: parent,
        searchText: `${parent}${subclassName}`
      };
    });

    suggestions.push(...uniqueClassNames);
  }

  if (methods !== null) {
    const uniqueMethodNames = _.uniq(methods).map((item: string) => {
      const [parent, methodName] = item.split('[state|');
      return {
        type: SuggestionType.Method,
        name: methodName,
        parent: parent,
        searchText: `${parent}[state|${methodName}`
      };
    });

    suggestions.push(...uniqueMethodNames);
  }

  return suggestions.filter(item => item.searchText.indexOf(keyword) !== -1);
}