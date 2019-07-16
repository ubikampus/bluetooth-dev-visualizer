module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.tsx", "src/**/*.ts"],
  globals: {
    DEFINE_NODE_ENV: "test",
    DEFINE_MAPBOX_TOKEN: "empty",
    "ts-jest": {
      diagnostics: false // disable type checking, leave that to webpack
    }
  },

  // https://jestjs.io/docs/en/webpack.html
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|babylon|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/fileMock.ts"
  },

  preset: "ts-jest",
  testRegex: "Test.tsx?$"
};
