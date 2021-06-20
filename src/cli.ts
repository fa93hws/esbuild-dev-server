import * as yargs from 'yargs';

import { buildModule } from './build';

export function main() {
  yargs
    .command(buildModule)
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
