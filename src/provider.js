const { CompletionItem, CompletionItemKind } = require('vscode')

const {
  findImportPath,
  getSuggestions,
} = require('./utils')

const path = require('path')

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

class CSSBlocksCompletionProvider {
  provideCompletionItems(document, position) {
    const lineText = document.lineAt(position.line).text;
    const currentDir = path.dirname(document.uri.fsPath)

    const empty = Promise.resolve([])

    if (!isTrigger(lineText, position)) {
      return empty
    }

    const words = getWords(lineText, position)

    if (words === '' || words.indexOf('.') === -1) {
      return empty
    }

    const [obj, ...fields] = words.split('.')
    const field = fields.join('[state|')

    const importPath = findImportPath(document.getText(), obj, currentDir)
    if (importPath === '') {
      return empty
    }

    const suggestions = getSuggestions(importPath, field)

    return Promise.resolve(
      suggestions.map(_class => {
        let name = _class.name

        if (_class.type === 'method') {
          return new CompletionItem(name, CompletionItemKind.Method)
        } else if (_class.type === 'class') {
          return new CompletionItem(name, CompletionItemKind.Variable)
        }
      })
    )
  }
}

module.exports = CSSBlocksCompletionProvider
