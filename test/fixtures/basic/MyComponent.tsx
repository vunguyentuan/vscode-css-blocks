import objstr from "obj-str";

import aStyles from "./MyComponent.block.css";
const otherStyles = require("./other.block.css");

function MyComponent() {
    let s = objstr({
        [aStyles.classOne]: true,
        [aStyles.classOne.mode("compact")]: true,
    });
    return <div className="aStyles otherStyles"></div>;
}
