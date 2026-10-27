import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import {
  ConsoleLogger,
  LogLevel,
  NodeJSFileSystem,
} from "@angular/compiler-cli";
import { createEs2015LinkerPlugin } from "@angular/compiler-cli/linker/babel";

const require = createRequire(import.meta.url);
const angularBuildRequire = createRequire(
  require.resolve("@angular/build/package.json"),
);
const { transformAsync } = angularBuildRequire("@babel/core");
const { build } = angularBuildRequire("esbuild");

const library = "@lucide/angular";
const sourceDir = "src";
const filename = require.resolve(library);

await link();
await treeShake();

async function link() {
  const source = readFileSync(filename, "utf8");

  if (!source.includes("ɵɵngDeclare")) {
    console.log(`${library}: already linked`);
    return;
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

async function treeShake() {
  if (!existsSync(sourceDir)) {
    console.log(`${library}: no ${sourceDir} directory, skipping tree-shaking`);
    return;
  }

  const imported = collectImportedNames();
  if (!imported) {
    return;
  }

  const source = readFileSync(filename, "utf8");
  const exported = new Set(
    [...source.matchAll(/export\s*\{([^}]*)\}/g)]
      .flatMap((match) => match[1].split(","))
      .map((name) =>
        name
          .trim()
          .split(/\s+as\s+/)
          .pop(),
      )
      .filter(Boolean),
  );
  const kept = [...imported].filter((name) => exported.has(name)).sort();

  const result = await build({
    stdin: {
      contents: `export { ${kept.join(", ")} } from "./${path.basename(filename)}";`,
      resolveDir: path.dirname(filename),
      loader: "js",
    },
    bundle: true,
    format: "esm",
    platform: "neutral",
    packages: "external",
    treeShaking: true,
    define: { ngDevMode: "false" },
    write: false,
    logLevel: "warning",
  });

  writeFileSync(filename, result.outputFiles[0].text);
  console.log(
    `${library}: kept ${kept.length} of ${exported.size} exports (${(source.length / 1e6).toFixed(1)}MB -> ${(result.outputFiles[0].text.length / 1e6).toFixed(1)}MB)`,
  );
}

function collectImportedNames() {
  const names = new Set();

  for (const file of listTypeScriptFiles(sourceDir)) {
    const text = readFileSync(file, "utf8");
    if (!text.includes(library)) {
      continue;
    }

    const quoted = `["']${library.replace("/", "\\/")}["']`;
    if (
      new RegExp(`import\\s+\\*\\s+as\\s+\\w+\\s+from\\s+${quoted}`).test(
        text,
      ) ||
      new RegExp(`export\\s+(\\*|\\{[^}]*\\})\\s+from\\s+${quoted}`).test(text)
    ) {
      console.warn(
        `${library}: unsupported import form in ${file}, skipping tree-shaking`,
      );
      return undefined;
    }

    const imports = new RegExp(
      `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*${quoted}`,
      "g",
    );
    for (const match of text.matchAll(imports)) {
      for (const specifier of match[1].split(",")) {
        const name = specifier
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)[0];
        if (name) {
          names.add(name);
        }
      }
    }
  }

  return names;
}

function listTypeScriptFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listTypeScriptFiles(entryPath);
    }
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".spec.ts")
      ? [entryPath]
      : [];
  });
}
