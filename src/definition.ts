import * as path from "path";
import { CancellationToken, DefinitionProvider, Location, Position, TextDocument, Uri } from "vscode";

import { findImportPath, getDefinitionKeyword, getDefinitionPositionByKeyword } from "./utils";

export class CSSBlockDefinitionProvider implements DefinitionProvider {
  async provideDefinition(document: TextDocument, position: Position, token: CancellationToken) {
    const lineText = document.lineAt(position.line).text;
    const currentDir = path.dirname(document.uri.fsPath);

    const words = getDefinitionKeyword(lineText, position);

    if (words === "" || words.indexOf(".") === -1) {
      return Promise.resolve(null);
    }

    const [obj, ...fields] = words.split(".");

    const importPath = findImportPath(
      document.getText(),
      obj,
      currentDir,
    );

    if (!importPath) {
      return Promise.resolve(null);
    }

    const targetPosition = await getDefinitionPositionByKeyword(importPath, fields);

    if (!targetPosition) {
      return Promise.resolve(null);
    } else {
      return Promise.resolve(
        new Location(Uri.file(importPath), targetPosition),
      );
    }
  }
}
