module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    cacheDirectory: "../.cache/jest",
    roots: ["src/", "tests/"],
    testMatch: ["**/*.test.ts"]
};
