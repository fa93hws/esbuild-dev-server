import type { Plugin } from 'esbuild';
import { green } from 'chalk';

export const logTimePlugin: Plugin = {
  name: 'log-time-plugin',
  setup(build) {
    build.onStart(() =>{
      console.log(green(`build started@${new Date().toISOString()}`));
    })
    build.onEnd(() => {
      console.log(green(`build finished@${new Date().toISOString()}`));
    });
  }
} 
