/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import { unwrap } from "@opticss/util";
import * as assert from "assert";
import { CompletionItemKind } from "vscode";

import * as cssBlocksUtils from "../src/utils";

import { fixture, fixtureDir } from "./helpers";

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function() {
    test("Can return the imported path for a named block.", function() {
        let component = fixture("basic", "MyComponent.tsx");
        let block = fixture("basic", "MyComponent.block.css");
        let p = cssBlocksUtils.findImportPath(
            unwrap(component.contents),
            "aStyles",
            fixtureDir("basic"),
        );
        assert.equal(p, block.path);
    });
    test("Can return the required path for a named block.", function() {
        let component = fixture("basic", "MyComponent.tsx");
        let block = fixture("basic", "other.block.css");
        let p = cssBlocksUtils.findImportPath(
            unwrap(component.contents),
            "otherStyles",
            fixtureDir("basic"),
        );
        assert.equal(p, block.path);
    });
    test("Can get suggestions.", function() {
        let block = fixture("basic", "MyComponent.block.css");
        return cssBlocksUtils.getSuggestions(
            block.path,
            [""],
        ).then((suggestions) => {
            assert.deepEqual(suggestions, [
                {
                    label: "topOne",
                    kind: CompletionItemKind.Function,
                },
                {
                    label: "exclusive",
                    kind: CompletionItemKind.Function,
                },
                {
                    label: "classOne",
                    kind: CompletionItemKind.Variable,
                },
                {
                    label: "classTwo",
                    kind: CompletionItemKind.Variable,
                },
            ]);
        });
    });
    test("Can get suggestions for a class.", function() {
        let block = fixture("basic", "MyComponent.block.css");
        return cssBlocksUtils.getSuggestions(
            block.path,
            ["classOne", ""],
        ).then((suggestions) => {
            assert.deepEqual(suggestions, [
                {
                    label: "mode",
                    kind: CompletionItemKind.Function,
                },
            ]);
        });
    });
});
