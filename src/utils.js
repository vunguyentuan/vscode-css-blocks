const path = require('path')
const fs = require('fs')
const _ = require('lodash')

function getCurrentLine(document, position) {
  return document.getText(document.lineAt(position).range)
}

function genImportRegExp(key) {
  const file = '(.+\\.\\S{1,2}ss)'
  const fromOrRequire = '(?:from\\s+|=\\s+require(?:<any>)?\\()'
  const requireEndOptional = '\\)?'
  const pattern = `${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`
  return new RegExp(pattern)
}

function findImportPath(text, key, parentPath) {
  const re = genImportRegExp(key)
  const results = re.exec(text)
  if (!!results && results.length > 0) {
    return path.resolve(parentPath, results[1])
  } else {
    return ''
  }
}

function getSuggestions(filePath, keyword) {
  if (!keyword) {
    keyword = ':scope'
  }

  const content = fs.readFileSync(filePath, { encoding: 'utf8' })
  const lines = content.match(/.*[,{]/g)
  if (lines === null) {
    return []
  }

  const methodRegex = /[.|:]\w+\[state\|[A-Za-z]\w+/g
  const classNameRegex = /\.[_A-Za-z0-9\-]+/g

  const selector = lines.join(' ')
  const classNames = selector.match(classNameRegex)
  const methods = selector.match(methodRegex)

  const suggestions = []

  if (classNames !== null) {
    const uniqueClassNames = _.uniq(classNames).map(item => {
      const subclassName = item.slice(1)
      const parent = ':scope'
      return {
        type: 'class',
        name: subclassName,
        parent: parent,
        searchText: `${parent}${subclassName}`
      }
    })

    suggestions.push(...uniqueClassNames)
  }

  if (methods !== null) {
    const uniqueMethodNames = _.uniq(methods).map(item => {
      const [parent, methodName] = item.split('[state|')
      return {
        type: 'method',
        name: methodName,
        parent: parent,
        searchText: `${parent}[state|${methodName}`
      }
    })

    suggestions.push(...uniqueMethodNames)
  }

  return suggestions.filter(item => item.searchText.indexOf(keyword) !== -1)
}

module.exports = {
  findImportPath,
  getCurrentLine,
  genImportRegExp,
  getSuggestions,
}
