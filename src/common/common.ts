import * as fs from 'fs';
import * as path from 'path';
import type { BuildResult } from 'esbuild';
import { template } from 'lodash';
import { green, yellow, red } from 'chalk';
import * as minifyHtml from '@minify-html/js';

import type { Options } from './config-type';

function assertExists({
  filePath,
  name,
  existsSync = fs.existsSync,
}: {
  filePath: string;
  name: string;
  existsSync?: typeof fs.existsSync;
}) {
  if (!existsSync(filePath)) {
    throw new Error(`${name} ${filePath} does not exist`);
  }
}

export function generateHtml({
  options,
  files,
  outdir,
  existsSync = fs.existsSync,
  writeFileSync = fs.writeFileSync,
}: {
  options: NonNullable<Options['htmlOptions']>;
  files: readonly string[];
  outdir: string;
  existsSync?: typeof fs.existsSync;
  writeFileSync?: typeof fs.writeFileSync;
}) {
  const { entry: templatePath, minify } = options;
  assertExists({ filePath: templatePath, name: 'templatePath', existsSync });
  assertExists({ filePath: outdir, name: 'outdir', existsSync });
  files.forEach((file, idx) =>
    assertExists({ filePath: file, name: `file[${idx}]`, existsSync }),
  );
  const templateContent = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  const jsFiles = files
    .filter((f) => path.extname(f) === '.js')
    .map((f) => path.relative(outdir, f));
  const cssFiles = files
    .filter((f) => path.extname(f) === '.css')
    .map((f) => path.relative(outdir, f));
  let htmlOutputContent = template(templateContent)({ jsFiles, cssFiles });
  if (minify) {
    const cfg = minifyHtml.createConfiguration({ minifyJs: false });
    htmlOutputContent = minifyHtml.minify(htmlOutputContent, cfg);
  }
  writeFileSync(path.join(outdir, 'index.html'), htmlOutputContent);
}

export async function doBuild({
  esbuild,
  options,
  writeFileSync = fs.writeFileSync,
  existsSync = fs.existsSync,
}: {
  esbuild: () => Promise<BuildResult> | BuildResult;
  options: Options;
  writeFileSync?: typeof fs.writeFileSync;
  existsSync?: typeof fs.existsSync;
}) {
  const { esbuildOptions, htmlOptions, mute } = options;
  mute || console.log(green(`build start@${new Date().toISOString()}`));
  const { warnings, outputFiles } = await esbuild();
  if (!mute && warnings.length > 0) {
    console.warn(yellow(warnings));
  }
  if (outputFiles == null || outputFiles.length === 0) {
    mute || console.error(red('no output files are generated'));
    process.exit(1);
  }
  outputFiles.forEach((file) => {
    fs.mkdirSync(path.dirname(file.path), { recursive: true });
    if (['.woff2', '.woff'].includes(path.extname(file.path))) {
      writeFileSync(file.path, file.contents);
    } else {
      writeFileSync(file.path, file.text);
    }
  });

  if (htmlOptions != null && esbuildOptions.outdir != null) {
    generateHtml({
      options: htmlOptions,
      files: outputFiles.map((f) => f.path),
      outdir: esbuildOptions.outdir,
      writeFileSync,
      existsSync,
    });
  }
  mute || console.log(green(`build success@${new Date().toISOString()}`));
}
