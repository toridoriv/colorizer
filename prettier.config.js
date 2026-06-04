import { prettierConfig } from "@toridoriv/eslint-config";

// eslint-disable-next-line no-unused-vars
const { printWidth, endOfLine, useTabs, ...config } = prettierConfig;

config.objectWrap = "collapse";

prettierConfig.overrides.push({ files: ["*.d.ts"], options: { parser: "typescript" } });

export default config;
