const vscode = require('vscode');

const {
  CompletionItem,
  CompletionItemKind
} = vscode

const path = require('path')
const _ = require('lodash')

const utils = require('./utils')
const {
  findImportPath,
  getAllClassNames,
  getCurrentLine,
  dashesCamelCase,
} = utils;

// check if current character or last character is .
function isTrigger(line, position) {
  const i = position.character - 1
  return line[i] === '.' || (i > 1 && line[i - 1] === '.')
}

function getWords(line, position) {
  const text = line.slice(0, position.character)
  const index = text.search(/[a-zA-Z0-9\._]*$/)
  if (index === -1) {
    return ''
  }

  return text.slice(index)
}

class CSSModuleCompletionProvider {
  // _classTransformer = null;

  constructor(camelCaseConfig) {
    switch (camelCaseConfig) {
      case true:
        this._classTransformer = _.camelCase
        break
      case 'dashes':
        this._classTransformer = dashesCamelCase
        break
      default:
        break
    }
  }

  provideCompletionItems(document, position) {
    const currentLine = getCurrentLine(document, position)
    const currentDir = path.dirname(document.uri.fsPath)

    const empty = Promise.resolve([])

    if (!isTrigger(currentLine, position)) {
      return empty
    }

    const words = getWords(currentLine, position)

    if (words === '' || words.indexOf('.') === -1) {
      return empty
    }

    const [obj, field] = words.split('.')

    const importPath = findImportPath(document.getText(), obj, currentDir)
    if (importPath === '') {
      return empty
    }

    const classNames = getAllClassNames(importPath, field)

    return Promise.resolve(
      classNames.map(_class => {
        let name = _class.name
        if (!!this._classTransformer) {
          name = this._classTransformer(name)
        }

        if (_class.type === "method") {
          return new CompletionItem(name, CompletionItemKind.Method)
        } else if (_class.type === "class") {
          return new CompletionItem(name, CompletionItemKind.Variable)
        }
      })
    )
  }
}

module.exports = CSSModuleCompletionProvider
