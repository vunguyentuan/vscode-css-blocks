import { postcss } from "opticss";

import { Attribute, Block, BlockClass, BlockFactory, Options, isBlockClass, resolveConfiguration } from "@css-blocks/core";
import { CompletionItem, CompletionItemKind, Position } from "vscode";

export function getSuggestions(block: Block, fields: Array<string>): Array<CompletionItem> {
  if (fields.length === 1) {
    const result: Array<CompletionItem> = [];

    const rootClassAttributes = block.rootClass.getAttributes();

    // :scope attributes
    rootClassAttributes.forEach(attr => {
      result.push(new CompletionItem(attr.name, CompletionItemKind.Function));
    });

    // other classes
    block.classes.forEach(cssClass => {
      if (!cssClass.isRoot) {
        result.push(new CompletionItem(cssClass.name, CompletionItemKind.Variable));
      }
    });

    return result;
  }

  const blockClass = block.lookup(`.${fields[0]}`);

  if (!blockClass) {
    return [];
  }

  if (isBlockClass(blockClass)) {
    return blockClass.getAttributes().map(attr => new CompletionItem(attr.name, CompletionItemKind.Function));
  }

  return [];
}

export function getSourcePosition(block: Block, selector: string): Position | undefined {
  if (!block.stylesheet || !block.stylesheet.nodes) {
    return;
  }

  const sourceNode = block.stylesheet.nodes.find(node => {
    if (node.type === "rule") {
      return node.selector.indexOf(selector) > -1;
    }

    return false;
  });

  if (!sourceNode || !sourceNode.source.start) { return; }

  return new Position(sourceNode.source.start.line - 1, sourceNode.source.start.column);
}

export function getAttrSourcePosition(attr: Attribute | null) {
  if (!attr) { return; }
  const selector = `${attr.blockClass.name}[${attr.namespace}|${attr.name}`;
  return getSourcePosition(attr.block, selector);
}

export function getClassSourcePosition(cssClass: BlockClass | null) {
  if (!cssClass) { return; }
  const selector = `.${cssClass.name}`;
  return getSourcePosition(cssClass.block, selector);
}

export function getPositionByKeyword(block: Block, fields: Array<string>): Position | undefined {
  // styles.button ["button"]
  // either root attributes or sub-classes
  if (fields.length === 1) {
    const attr = block.rootClass.getAttribute(`[state|${fields[0]}]`);
    const cssClass = block.getClass(fields[0]);

    return getAttrSourcePosition(attr) || getClassSourcePosition(cssClass);
  }

  // styles.button.size("large") ["button", "size"]
  // find sub-class attributes
  if (fields.length === 2) {
    const blockClass = block.getClass(fields[0]);

    if (!blockClass) {
      return;
    }

    if (blockClass instanceof BlockClass) {
      const blockAttr = blockClass.getAttribute(`[state|${fields[1]}]`);

      return getAttrSourcePosition(blockAttr);
    }
  }

  return;
}

export function parse(filename: string, cssBlocksOpts?: Options) {
  const config = resolveConfiguration(cssBlocksOpts);
  let factory = new BlockFactory(config, postcss);
  return factory.getBlockFromPath(filename);
}
