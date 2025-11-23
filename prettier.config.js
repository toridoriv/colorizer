import { prettierConfig } from "@toridoriv/eslint-config";

// eslint-disable-next-line no-unused-vars
const { printWidth, endOfLine, useTabs, ...config } = prettierConfig;

config.objectWrap = "collapse";

export default config;
