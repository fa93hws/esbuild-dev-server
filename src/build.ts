import * as path from 'path';
import * as yargs from 'yargs';
import { build } from 'esbuild';
import type { BuildOptions } from 'esbuild';
import { yellow } from 'chalk';

import type { Options } from './config-type';

type CliArgs = {
  // config path
  config: string;
  watch: boolean;
};

function registerCleanup(callback: () => unknown) {
  process.on('uncaughtException', callback);
  process.on('SIGINT', callback);
  process.on('SIGUSR1', callback);
  process.on('SIGUSR2', callback);
  process.on('beforeExit', callback);
}

async function buildOnce(buildOptions: BuildOptions) {
  const { warnings, errors } = await build(buildOptions);
  if (warnings.length > 0) {
    console.warn(yellow(warnings));
  }
  if (errors.length > 0) {
    throw errors;
  }
}

async function watchBuild(buildOptions: BuildOptions) {
  return build({
    ...buildOptions,
    watch: true,
  }).then(result => {
    registerCleanup(() => result.stop && result.stop());
  })
}

function handler({ config, watch }: CliArgs) {
  const absConfigPath = path.isAbsolute(config)
    ? config
    : path.resolve(process.cwd(), config);
  // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
  const options: Options = require(absConfigPath);
  const buildPromise = watch
    ? watchBuild(options.esbuildOptions)
    : buildOnce(options.esbuildOptions);
    buildPromise.catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export const buildModule: yargs.CommandModule<unknown, CliArgs> = {
  command: 'build',
  describe: 'build with esbuild',
  builder: (): yargs.Argv<CliArgs> =>
    yargs.option('config', {
      demandOption: true,
      type: 'string',
      description: 'path to config path',
    })
    .option('watch', {
      type: 'boolean',
      default: false,
      description: 'whether run esbuild in watch mode'
    }),
  handler,
};
