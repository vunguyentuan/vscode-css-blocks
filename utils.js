const path = require("path");
const fs = require("fs");
const _ = require("lodash");

function getCurrentLine(document, position) {
    return document.getText(document.lineAt(position).range);
}

function genImportRegExp(key) {
    const file = "(.+\\.\\S{1,2}ss)";
    const fromOrRequire = "(?:from\\s+|=\\s+require(?:<any>)?\\()";
    const requireEndOptional = "\\)?";
    const pattern = `${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
    return new RegExp(pattern);
}

function findImportPath(text, key, parentPath) {
    const re = genImportRegExp(key);
    const results = re.exec(text);
    if (!!results && results.length > 0) {
        return path.resolve(parentPath, results[1]);
    } else {
        return "";
    }
}

function getAllClassNames(filePath, keyword) {
    const content = fs.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.match(/.*[,{]/g);
    if (lines === null) {
        return [];
    }
    
    const methodRegex = /[.|:]\w+\[state\|[A-Za-z]\w+/g
    const classNameRegex = /\.[_A-Za-z0-9\-]+/g

    const selector = lines.join(" ")
    const classNames = selector.match(classNameRegex);
    const methods = selector.match(methodRegex);

    const result = []

    if (classNames !== null) {
        const uniqueClassNames = _.uniq(classNames).map(item => {
            const subclassName = item.slice(1)
            return {
                type: 'class',
                name: subclassName,
                searchText: subclassName
            }
        })

        result.push(...uniqueClassNames)
    }

    if (methods !== null) {
        const uniqueMethodNames = _.uniq(methods).map(item => {
            const [selectorName, methodName] = item.split('[state|')
            return {
                type: 'method',
                name: methodName,
                selectorName: selectorName,
                searchText: `${selectorName} ${methodName}`
            };
        })

        result.push(...uniqueMethodNames)
    }

    return keyword !== "" ? result.filter(item => item.searchText.indexOf(keyword) !== -1) : result;
}

// from css-loader's implementation
// source: https://github.com/webpack-contrib/css-loader/blob/22f6621a175e858bb604f5ea19f9860982305f16/lib/compile-exports.js
function dashesCamelCase(str) {
  return str.replace(/-(\w)/g, function(match, firstLetter) {
    return firstLetter.toUpperCase();
  });
}

module.exports = {
    findImportPath,
    getCurrentLine,
    genImportRegExp,
    getAllClassNames,
    dashesCamelCase,
}