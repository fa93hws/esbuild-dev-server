import * as fs from 'fs';
import * as path from 'path';
import type { Plugin, BuildResult } from 'esbuild';
import { template as renderEjs } from 'lodash';
import * as minifyHtml from '@minify-html/js';

export type htmlPluginParams = {
  template: string;
  minify: boolean;
  output: string;
}

function createHTML(args: htmlPluginParams, result: BuildResult) {
  if (result.errors.length > 0) {
    console.log('there is error in build, html plugin will not start');
    return;
  }
  if (result.metafile == null)  {
    throw new Error('html plugin need metaFile to be turned on');
  }
  if (Object.keys(result.metafile.outputs).length === 0) {
    console.log('not output found, html plugin will not start');
    return;
  }
  const outputfiles = Object.keys(result.metafile.outputs)
    .map(file => path.join(process.cwd(), file));
  const outdir = path.dirname(args.output);
  fs.mkdirSync(outdir, { recursive: true });
  const jsFiles = outputfiles
    .filter((f) => path.extname(f) === '.js')
    .map((f) => path.relative(outdir, f));
  const cssFiles = outputfiles
    .filter((f) => path.extname(f) === '.css')
    .map((f) => path.relative(outdir, f));
  let htmlOutputContent = renderEjs(args.template)({ jsFiles, cssFiles });
  if (args.minify) {
    const cfg = minifyHtml.createConfiguration({ minifyJs: false });
    htmlOutputContent = minifyHtml.minify(htmlOutputContent, cfg);
  }
  fs.writeFileSync(path.join(outdir, 'index.html'), htmlOutputContent);
}

export function htmlPluginFactory(args: htmlPluginParams): Plugin {
  return {
    name: 'esbuild-html-plugin',
    setup(build) {
      build.initialOptions.metafile = true;
      build.onEnd((result) => createHTML(args, result));
    }
  }
} 
