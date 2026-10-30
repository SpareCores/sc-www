/*
 * Shrinks @lucide/angular before `ng build` to keep the Docker build within
 * Render's 8GB builder memory limit.
 *
 * Why: @lucide/angular ships all ~1,900 icons in a single 10.6MB partially
 * compiled bundle. Angular's Babel-based linker and advanced optimizations
 * process the whole file for both the browser and the server bundle, which
 * pushed the build to 6.5-7.6GB peak memory and caused random OOM failures.
 *
 * What it does, in place in node_modules:
 * 1. Links the bundle once with Angular's own linker (same options as
 *    `ng build`), so the build does not have to link it again.
 * 2. Tree-shakes the linked bundle with esbuild down to the exports imported
 *    from @lucide/angular in src/**\/*.ts (excluding specs), with
 *    ngDevMode=false as in production builds (14.4MB -> 0.9MB).
 *
 * Both steps are idempotent. Tree-shaking is skipped when there is no src
 * directory or when an `import * as` or re-export from the package is found,
 * leaving the full linked bundle in place.
 *
 * Only the Dockerfile runs this script, so local development and tests use
 * the untouched package. The output was verified to produce identical
 * bundles and prerendered pages. It can be removed once @lucide/angular
 * ships per-icon entry points or the build has enough memory headroom.
 */
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
      new RegExp(
        `export\\s+(\\*(\\s+as\\s+\\w+)?|\\{[^}]*\\})\\s+from\\s+${quoted}`,
      ).test(text) ||
      new RegExp(`import\\s*\\(\\s*${quoted}\\s*\\)`).test(text)
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
