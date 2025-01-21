/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json"
    }
  }
};
