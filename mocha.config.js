module.exports = {
    require: ["ts-node/register"],
    extensions: ["ts"],
    spec: "tests/**/*.test.ts",
    "node-option": ["loader=ts-node/esm"],
};
