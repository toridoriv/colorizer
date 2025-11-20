import { colorize } from "./index.ts";

console.log(await colorize.shell("docker build -t my-image ."));
