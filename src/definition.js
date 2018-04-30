const vscode_1 = require('vscode')
const utils_1 = require('./utils')
const path = require('path')
const fs = require('fs')

function getWords(line, position) {
  const headText = line.slice(0, position.character)
  const startIndex = headText.search(/[a-zA-Z0-9\._]*$/)
  // not found or not clicking object field
  if (startIndex === -1 || headText.slice(startIndex).indexOf('.') === -1) {
    return ''
  }
  const match = /^([a-zA-Z0-9\._]*)/.exec(line.slice(startIndex))
  if (match === null) {
    return ''
  }

  const fullMatch = match[1];

  // "styles.icon.animate".slice(0, 35 - 25)
  // styles.ico

  const fullParts = fullMatch.split('.');
  const parts = fullMatch.slice(0, position.character - startIndex).split('.');

  return parts.map((part, index) => fullParts[index]).join('.')
}

function getPosition(filePath, className) {
  const content = fs.readFileSync(filePath, { encoding: 'utf8' })
  const lines = content.split('\n').reduce((selectors, line, index) => {
    if (line.match(/.*[,{]/g)) {
      return selectors.concat({
        lineNumber: index,
        text: line
      })
    }
    return selectors
  }, [])

  let lineNumber = -1
  let character = -1
  let keyWord = className

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i]
    
    const line = originalLine.text
    character = line.indexOf(keyWord)
    
    if (character !== -1) {
      lineNumber = originalLine.lineNumber
      break
    }
  }

  if (lineNumber === -1) {
    return null
  } else {
    return new vscode_1.Position(lineNumber, character)
  }
}

function isImportLineMatch(line, matches, current) {
  if (matches === null) {
    return false
  }
  const start1 = line.indexOf(matches[1]) + 1
  const start2 = line.indexOf(matches[2]) + 1
  // check current character is between match words
  return (
    (current > start2 && current < start2 + matches[2].length) ||
    (current > start1 && current < start1 + matches[1].length)
  )
}

class CSSBlockDefinitionProvider {
  provideDefinition(document, position, token) {
    const lineText = document.lineAt(position.line).text;
    const currentDir = path.dirname(document.uri.fsPath)
    const matches = utils_1.genImportRegExp('(\\S+)').exec(lineText)
    if (isImportLineMatch(lineText, matches, position.character)) {
      return Promise.resolve(
        new vscode_1.Location(
          vscode_1.Uri.file(path.resolve(currentDir, matches[2])),
          new vscode_1.Position(0, 0)
        )
      )
    }

    const words = getWords(lineText, position)

    if (words === '' || words.indexOf('.') === -1) {
      return Promise.resolve(null)
    }

    const [obj, ...fields] = words.split('.')
    const field = fields.join('[state|')
    const importPath = utils_1.findImportPath(
      document.getText(),
      obj,
      currentDir
    )

    if (importPath === '') {
      return Promise.resolve(null)
    }

    const targetPosition = getPosition(importPath, field)

    if (targetPosition === null) {
      return Promise.resolve(null)
    } else {
      return Promise.resolve(
        new vscode_1.Location(vscode_1.Uri.file(importPath), targetPosition)
      )
    }
  }
}

module.exports = CSSBlockDefinitionProvider
