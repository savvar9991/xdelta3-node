import assert from "assert";
const { createRequire } = await import("node-zigar/cjs");

interface ZigArray<T = Uint8Array> {
  typedArray: T;
  string: string;
  base64: string;
}

interface ZigModule {
  encodeSync(src: Uint8Array, dest: Uint8Array): ZigArray;
  decodeSync(src: Uint8Array, patch: Uint8Array): ZigArray;
}

const xdelta3Node = createRequire(import.meta.url)(
  process.env.MODE === "test" || process.env.DEV
    ? "../zig/xdelta3-node.zig"
    : "../lib/xdelta3-node.zigar"
) as ZigModule;

export function encodeSync(src: Uint8Array, dest: Uint8Array): Uint8Array {
  assert(
    src.constructor === Uint8Array || Buffer.isBuffer(src),
    "src value should be an Uint8Array"
  );
  assert(
    dest.constructor === Uint8Array || Buffer.isBuffer(dest),
    "dest value should be an Uint8Array"
  );

  return xdelta3Node.encodeSync(src, dest).typedArray;
}

export function decodeSync(src: Uint8Array, patch: Uint8Array): Uint8Array {
  assert(
    src.constructor === Uint8Array || Buffer.isBuffer(src),
    "src value should be an Uint8Array"
  );
  assert(
    patch.constructor === Uint8Array || Buffer.isBuffer(patch),
    "patch value should be an Uint8Array"
  );

  return xdelta3Node.decodeSync(src, patch).typedArray;
}
