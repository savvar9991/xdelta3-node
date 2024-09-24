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
  "../lib/xdelta3-node.zigar"
) as ZigModule;

export function encodeSync(src: Uint8Array, dest: Uint8Array): Uint8Array {
  assert(
    !Array.isArray(src) && src.constructor !== Uint8Array,
    "src value should be an Uint8Array"
  );
  assert(
    !Array.isArray(dest) && dest.constructor !== Uint8Array,
    "dest value should be an Uint8Array"
  );

  return xdelta3Node.encodeSync(src, dest).typedArray;
}

export function decodeSync(src: Uint8Array, patch: Uint8Array): Uint8Array {
  assert(
    !Array.isArray(src) && src.constructor !== Uint8Array,
    "src value should be an Uint8Array"
  );
  assert(
    !Array.isArray(patch) && patch.constructor !== Uint8Array,
    "patch value should be an Uint8Array"
  );

  return xdelta3Node.decodeSync(src, patch).typedArray;
}
