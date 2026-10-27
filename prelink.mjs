import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  ConsoleLogger,
  LogLevel,
  NodeJSFileSystem,
} from "@angular/compiler-cli";
import { createEs2015LinkerPlugin } from "@angular/compiler-cli/linker/babel";

const require = createRequire(import.meta.url);
const { transformAsync } = createRequire(
  require.resolve("@angular/build/package.json"),
)("@babel/core");

const libraries = ["@lucide/angular"];

for (const library of libraries) {
  const filename = require.resolve(library);
  const source = readFileSync(filename, "utf8");

  if (!source.includes("ɵɵngDeclare")) {
    console.log(`${library}: already linked`);
    continue;
  }

  const result = await transformAsync(source, {
    filename,
    inputSourceMap: false,
    sourceMaps: false,
    compact: false,
    configFile: false,
    babelrc: false,
    browserslistConfigFile: false,
    plugins: [
      createEs2015LinkerPlugin({
        linkerJitMode: false,
        sourceMapping: false,
        fileSystem: new NodeJSFileSystem(),
        logger: new ConsoleLogger(LogLevel.warn),
      }),
    ],
  });

  writeFileSync(
    filename,
    result.code.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, ""),
  );
  console.log(`${library}: linked ${filename}`);
}
