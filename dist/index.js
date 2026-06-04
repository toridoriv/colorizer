// @ts-ignore

// source/code-to-ansi.ts
import makeSynchronous from "./make-synchronous.js";
var codeToANSI = makeSynchronous(codeToANSIAsync);
async function codeToANSIAsync(code, lang, theme) {
  const { default: c } = await import("chalk");
  const { codeToTokensBase, getSingletonHighlighter } = await import("shiki");
  function normalizeHex(hex) {
    hex = hex.replace(/#/, "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length === 4) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    if (hex.length === 6) hex = `${hex}ff`;
    return hex.toLowerCase();
  }
  function hexToRgba(hex) {
    hex = normalizeHex(hex);
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = Number.parseInt(hex.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }
  function RgbToHex(r, g, b) {
    return [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join("");
  }
  function hexApplyAlpha(hex, type = "dark") {
    const { r, g, b, a } = hexToRgba(hex);
    if (type === "dark") return RgbToHex(r * a, g * a, b * a);
    else return RgbToHex(r * a + 255 * (1 - a), g * a + 255 * (1 - a), b * a + 255 * (1 - a));
  }
  let output = "";
  const lines = await codeToTokensBase(code, { lang, theme });
  const highlight = await getSingletonHighlighter();
  const themeReg = highlight.getTheme(theme);
  for (const line of lines) {
    for (const token of line) {
      let text = token.content;
      const color = token.color || themeReg.fg;
      if (color) text = c.hex(hexApplyAlpha(color, themeReg.type))(text);
      if (token.fontStyle) {
        if (token.fontStyle & 2 /* Bold */) text = c.bold(text);
        if (token.fontStyle & 1 /* Italic */) text = c.italic(text);
        if (token.fontStyle & 4 /* Underline */) text = c.underline(text);
        if (token.fontStyle & 8 /* Strikethrough */) text = c.strikethrough(text);
      }
      output += text;
    }
    output += "\n";
  }
  return output;
}

// source/format.ts
import makeSynchronous2 from "./make-synchronous.js";
var format = makeSynchronous2(formatAsync);
async function formatAsync(code, language, options = {}) {
  const parser = {
    xml: "html",
    html: "html",
    json: "json",
    jsonc: "jsonc",
    json5: "json5",
    markdown: "markdown",
    javascript: "espree",
    typescript: "typescript",
    css: "css",
    scss: "scss",
    less: "less",
    graphql: "graphql",
    mdx: "mdx",
    vue: "vue",
    angular: "angular",
    mjml: "mjml",
    yaml: "yaml",
  }[language];
  const { debuglog } = await import("node:util");
  const log = debuglog("syntax-highlight:format");
  if (!parser) {
    log("\u26A0\uFE0F No parser found for language: %s", language);
    return code;
  }
  log("\u2139\uFE0F  Formatting code with parser: %s", parser);
  const prettierPluginXML = await import("@prettier/plugin-xml");
  const prettier = await import("prettier");
  const result = await prettier.format(code, {
    parser,
    plugins: [prettierPluginXML.default],
    printWidth: process.stdout.columns || 80,
    singleAttributePerLine: false,
    tabWidth: 2,
    useTabs: false,
    trailingComma: "all",
    bracketSameLine: true,
    bracketSpacing: true,
    objectWrap: "preserve",
    htmlWhitespaceSensitivity: "ignore",
    endOfLine: "lf",
    quoteProps: "consistent",
    xmlSortAttributesByKey: true,
    xmlWhitespaceSensitivity: "ignore",
    ...options,
  });
  return result;
}

// source/index.ts
function createCodeColorizer(language) {
  return {
    [language](code, theme = "dracula") {
      try {
        code = format(code, language);
      } catch (error) {
        console.debug("Prettier failed to format code", error);
      }
      return codeToANSI(code.trim(), language, theme);
    },
  }[language];
}
var colorize = (() => {
  const colorizer = {};
  const handler = {
    get(target, prop, receiver) {
      const language = prop;
      let codeColorizer = target[language];
      if (!codeColorizer) {
        codeColorizer = createCodeColorizer(language);
      }
      if (target !== receiver) {
        target[language] = codeColorizer;
      }
      return codeColorizer;
    },
  };
  return new Proxy(colorizer, handler);
})();
function isJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
function getLanguage(value) {
  const trimmed = value.trim();
  const firstSymbol = trimmed[0];
  const lastSymbol = trimmed[trimmed.length - 1];
  if (isJson(trimmed)) {
    return "json";
  }
  if (trimmed.startsWith("<!DOCTYPE html>")) {
    return "html";
  }
  if (firstSymbol === "<" && lastSymbol === ">") {
    return "xml";
  }
  return "markdown";
}
export { colorize, getLanguage, isJson };
