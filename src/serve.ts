import * as path from 'path';
import * as yargs from 'yargs';
import { green } from 'chalk';
import { serve as esbuildServe, BuildResult } from 'esbuild';

import type { DevOptions } from './common/config-type';
import { doBuild } from './common/common';

type CliArgs = {
  // config path
  config: string;
};

function registerCleanup(callback: () => unknown) {
  process.on('uncaughtException', callback);
  process.on('SIGINT', callback);
  process.on('SIGUSR1', callback);
  process.on('SIGUSR2', callback);
  process.on('beforeExit', callback);
}

function handler({ config }: CliArgs) {
  const absConfigPath = path.isAbsolute(config)
    ? config
    : path.resolve(process.cwd(), config);
  // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
  const options: DevOptions = require(absConfigPath);
  esbuildServe(options.serveOptions, options.esbuildOptions).then(server => {
    console.log(green(`hosted on http://${server.host}:${server.port}`));
    registerCleanup(() => server.stop());
    // console.log(server)
    // server.stop();
  })
  // const buildInServe = () => new Promise<BuildResult>((resolve, reject) => {

  // });
  // doBuild({
  //   // esbuild: () => buildSync(options.esbuildOptions),
  //   esbuild: buildInServe,
  //   options,
  // }).catch((e) => {
  //   console.error(e);
  //   process.exit(1);
  // });
}

export const serveModule: yargs.CommandModule<unknown, CliArgs> = {
  command: 'serve',
  describe: 'serve with esbuild',
  builder: (): yargs.Argv<CliArgs> =>
    yargs.option('config', {
      demandOption: true,
      type: 'string',
      description: 'path to config path',
    }),
  handler,
};
