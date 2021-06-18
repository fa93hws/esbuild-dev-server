import type { BuildOptions, ServeOptions } from 'esbuild';

export type Options = {
  esbuildOptions: BuildOptions;

  mute?: boolean;
  htmlOptions?: {
    minify: boolean;
    entry: string;
  } | null;
};

export type DevOptions = Options & {
  serveOptions: ServeOptions;
}
