import { describe, it, expect } from "vitest";
import { encodeSync, decodeSync } from "../../index";
import fs from "node:fs";
import path from "node:path";

// As the git have limit on file size, so we have to split large files into multiple chunks
function readFiles(prefix: string, suffixes?: string[]): Uint8Array {
  let output = Buffer.alloc(0);

  if (!suffixes || suffixes.length === 0) {
    output = fs.readFileSync(prefix);
  } else {
    for (const suffix of suffixes) {
      output = Buffer.concat([output, fs.readFileSync(`${prefix}-${suffix}`)]);
    }
  }

  return Uint8Array.from(output);
}

function taFor(text: string): Uint8Array {
  return Uint8Array.from(Buffer.from(text, "utf8"));
}

describe("xdelta3-node", () => {
  describe("encodeSync", () => {
    it("should not throw any error", () => {
      expect(() =>
        encodeSync(taFor("init"), taFor("init-updated"))
      ).not.toThrow();
    });

    it("should encode successfully", () => {
      const patch = encodeSync(taFor("init"), taFor("init+updated"));

      expect(patch).toBeDefined();
      expect(patch).toBeInstanceOf(Uint8Array);
      expect(patch.byteLength).greaterThan(0);
    });

    it("should encode successfully with large data", () => {
      const src = readFiles(
        path.resolve(import.meta.dirname, "../data/holesky-state-src-2548736"),
        ["00", "01", "02"]
      );
      const dest = readFiles(
        path.resolve(import.meta.dirname, "../data/holesky-state-dest-2548736"),
        ["00", "01", "02"]
      );
      const expectedPatch = fs.readFileSync(
        path.resolve(import.meta.dirname, "../data/holesky-state-patch-2548736")
      );

      const patch = encodeSync(src, dest);

      expect(patch).toBeDefined();
      expect(patch).toBeInstanceOf(Uint8Array);
      expect(patch.byteLength).greaterThan(0);
      expect(Buffer.from(patch).toString("hex")).toEqual(
        Buffer.from(expectedPatch).toString("hex")
      );
    });
  });

  describe("decodeSync", () => {
    it("should not throw any error", () => {
      const patch = encodeSync(
        Buffer.from("init"),
        Buffer.from("init-updated")
      );

      expect(() => decodeSync(Buffer.from("init"), patch)).not.toThrow();
    });

    it("should decode successfully", () => {
      const src = taFor("init");
      const dest = taFor("init+updated");

      const patch = encodeSync(src, dest);

      const output = decodeSync(taFor("init"), patch);

      expect(Buffer.from(output).toString("utf8")).toStrictEqual(
        Buffer.from(dest).toString("utf8")
      );
    });

    it("should encode successfully with large data", () => {
      const src = readFiles(
        path.resolve(import.meta.dirname, "../data/holesky-state-src-2548736"),
        ["00", "01", "02"]
      );
      const dest = readFiles(
        path.resolve(import.meta.dirname, "../data/holesky-state-dest-2548736"),
        ["00", "01", "02"]
      );
      const patch = readFiles(
        path.resolve(import.meta.dirname, "../data/holesky-state-patch-2548736")
      );

      const reproducedOutput = decodeSync(src, patch);

      expect(reproducedOutput).toBeDefined();
      expect(Buffer.from(reproducedOutput).toString("hex")).toEqual(
        Buffer.from(dest).toString("hex")
      );
    });
  });
});
