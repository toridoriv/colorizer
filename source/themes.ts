import andromeeda from "@shikijs/themes/andromeeda";
import auroraX from "@shikijs/themes/aurora-x";
import ayuDark from "@shikijs/themes/ayu-dark";
import ayuLight from "@shikijs/themes/ayu-light";
import ayuMirage from "@shikijs/themes/ayu-mirage";
import catppuccinFrappe from "@shikijs/themes/catppuccin-frappe";
import catppuccinLatte from "@shikijs/themes/catppuccin-latte";
import catppuccinMacchiato from "@shikijs/themes/catppuccin-macchiato";
import catppuccinMocha from "@shikijs/themes/catppuccin-mocha";
import darkPlus from "@shikijs/themes/dark-plus";
import dracula from "@shikijs/themes/dracula";
import draculaSoft from "@shikijs/themes/dracula-soft";
import everforestDark from "@shikijs/themes/everforest-dark";
import everforestLight from "@shikijs/themes/everforest-light";
import githubDark from "@shikijs/themes/github-dark";
import githubDarkDefault from "@shikijs/themes/github-dark-default";
import githubDarkDimmed from "@shikijs/themes/github-dark-dimmed";
import githubDarkHighContrast from "@shikijs/themes/github-dark-high-contrast";
import githubLight from "@shikijs/themes/github-light";
import githubLightDefault from "@shikijs/themes/github-light-default";
import githubLightHighContrast from "@shikijs/themes/github-light-high-contrast";
import gruvboxDarkHard from "@shikijs/themes/gruvbox-dark-hard";
import gruvboxDarkMedium from "@shikijs/themes/gruvbox-dark-medium";
import gruvboxDarkSoft from "@shikijs/themes/gruvbox-dark-soft";
import gruvboxLightHard from "@shikijs/themes/gruvbox-light-hard";
import gruvboxLightMedium from "@shikijs/themes/gruvbox-light-medium";
import gruvboxLightSoft from "@shikijs/themes/gruvbox-light-soft";
import horizon from "@shikijs/themes/horizon";
import horizonBright from "@shikijs/themes/horizon-bright";
import houston from "@shikijs/themes/houston";
import kanagawaDragon from "@shikijs/themes/kanagawa-dragon";
import kanagawaLotus from "@shikijs/themes/kanagawa-lotus";
import kanagawaWave from "@shikijs/themes/kanagawa-wave";
import laserwave from "@shikijs/themes/laserwave";
import lightPlus from "@shikijs/themes/light-plus";
import materialTheme from "@shikijs/themes/material-theme";
import materialThemeDarker from "@shikijs/themes/material-theme-darker";
import materialThemeLighter from "@shikijs/themes/material-theme-lighter";
import materialThemeOcean from "@shikijs/themes/material-theme-ocean";
import materialThemePalenight from "@shikijs/themes/material-theme-palenight";
import minDark from "@shikijs/themes/min-dark";
import minLight from "@shikijs/themes/min-light";
import monokai from "@shikijs/themes/monokai";
import nightOwl from "@shikijs/themes/night-owl";
import nightOwlLight from "@shikijs/themes/night-owl-light";
import nord from "@shikijs/themes/nord";
import oneDarkPro from "@shikijs/themes/one-dark-pro";
import oneLight from "@shikijs/themes/one-light";
import plastic from "@shikijs/themes/plastic";
import poimandres from "@shikijs/themes/poimandres";
import red from "@shikijs/themes/red";
import rosePine from "@shikijs/themes/rose-pine";
import rosePineDawn from "@shikijs/themes/rose-pine-dawn";
import rosePineMoon from "@shikijs/themes/rose-pine-moon";
import slackDark from "@shikijs/themes/slack-dark";
import slackOchin from "@shikijs/themes/slack-ochin";
import snazzyLight from "@shikijs/themes/snazzy-light";
import solarizedDark from "@shikijs/themes/solarized-dark";
import solarizedLight from "@shikijs/themes/solarized-light";
import synthwave84 from "@shikijs/themes/synthwave-84";
import tokyoNight from "@shikijs/themes/tokyo-night";
import vesper from "@shikijs/themes/vesper";
import vitesseBlack from "@shikijs/themes/vitesse-black";
import vitesseDark from "@shikijs/themes/vitesse-dark";
import vitesseLight from "@shikijs/themes/vitesse-light";

export type Theme =
  | "andromeeda"
  | "aurora-x"
  | "ayu-dark"
  | "ayu-light"
  | "ayu-mirage"
  | "catppuccin-frappe"
  | "catppuccin-latte"
  | "catppuccin-macchiato"
  | "catppuccin-mocha"
  | "dark-plus"
  | "dracula"
  | "dracula-soft"
  | "everforest-dark"
  | "everforest-light"
  | "github-dark"
  | "github-dark-default"
  | "github-dark-dimmed"
  | "github-dark-high-contrast"
  | "github-light"
  | "github-light-default"
  | "github-light-high-contrast"
  | "gruvbox-dark-hard"
  | "gruvbox-dark-medium"
  | "gruvbox-dark-soft"
  | "gruvbox-light-hard"
  | "gruvbox-light-medium"
  | "gruvbox-light-soft"
  | "horizon"
  | "horizon-bright"
  | "houston"
  | "kanagawa-dragon"
  | "kanagawa-lotus"
  | "kanagawa-wave"
  | "laserwave"
  | "light-plus"
  | "material-theme"
  | "material-theme-darker"
  | "material-theme-lighter"
  | "material-theme-ocean"
  | "material-theme-palenight"
  | "min-dark"
  | "min-light"
  | "monokai"
  | "night-owl"
  | "night-owl-light"
  | "nord"
  | "one-dark-pro"
  | "one-light"
  | "plastic"
  | "poimandres"
  | "red"
  | "rose-pine"
  | "rose-pine-dawn"
  | "rose-pine-moon"
  | "slack-dark"
  | "slack-ochin"
  | "snazzy-light"
  | "solarized-dark"
  | "solarized-light"
  | "synthwave-84"
  | "tokyo-night"
  | "vesper"
  | "vitesse-black"
  | "vitesse-dark"
  | "vitesse-light";

export const themes = [
  andromeeda,
  auroraX,
  ayuDark,
  ayuLight,
  ayuMirage,
  catppuccinFrappe,
  catppuccinLatte,
  catppuccinMacchiato,
  catppuccinMocha,
  darkPlus,
  dracula,
  draculaSoft,
  everforestDark,
  everforestLight,
  githubDark,
  githubDarkDefault,
  githubDarkDimmed,
  githubDarkHighContrast,
  githubLight,
  githubLightDefault,
  githubLightHighContrast,
  gruvboxDarkHard,
  gruvboxDarkMedium,
  gruvboxDarkSoft,
  gruvboxLightHard,
  gruvboxLightMedium,
  gruvboxLightSoft,
  horizon,
  horizonBright,
  houston,
  kanagawaDragon,
  kanagawaLotus,
  kanagawaWave,
  laserwave,
  lightPlus,
  materialTheme,
  materialThemeDarker,
  materialThemeLighter,
  materialThemeOcean,
  materialThemePalenight,
  minDark,
  minLight,
  monokai,
  nightOwl,
  nightOwlLight,
  nord,
  oneDarkPro,
  oneLight,
  plastic,
  poimandres,
  red,
  rosePine,
  rosePineDawn,
  rosePineMoon,
  slackDark,
  slackOchin,
  snazzyLight,
  solarizedDark,
  solarizedLight,
  synthwave84,
  tokyoNight,
  vesper,
  vitesseBlack,
  vitesseDark,
  vitesseLight,
];
