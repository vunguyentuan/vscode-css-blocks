import { Maybe, none, some } from "@opticss/util";
import * as fs from "fs";
import * as path from "path";

interface Fixture {
    path: string;
    contents: Maybe<string>;
}
export function fixture(name: string, relativePath: string): Fixture {
    let fixture = path.resolve(fixtureDir(name), relativePath);
    let contents: Maybe<string>;
    if (fs.existsSync(fixture)) {
        contents = some(fs.readFileSync(fixture, "utf8"));
    } else {
        contents = none(`fixture file does not exist: ${fixture}`);
    }
    return {
        path: fixture,
        contents,
    };
}

export function fixtureDir(name: string) {
    return path.resolve(__dirname, "..", "..", "test", "fixtures", name);
}
