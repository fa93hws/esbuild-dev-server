import * as path from 'path';
import * as yargs from 'yargs';
import { buildSync } from 'esbuild';

import type { Options } from './common/config-type';
import { doBuild } from './common/common';

type CliArgs = {
  // config path
  config: string;
};

function handler({ config }: CliArgs) {
  const absConfigPath = path.isAbsolute(config)
    ? config
    : path.resolve(process.cwd(), config);
  // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
  const options: Options = require(absConfigPath);
  doBuild({
    esbuild: () => buildSync(options.esbuildOptions),
    options,
  }).catch((e) => {
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
    }),
  handler,
};
