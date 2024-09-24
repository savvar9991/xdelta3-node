declare module "node-zigar/cjs" {
  export function createRequire(url: string): (modulePath: string) => unknown;
}