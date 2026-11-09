/**
 * Unit tests for attachment validation.
 *
 * `validateAttachment` lives in `lib/attachments-config.ts` (not the DAL) so it
 * is importable without a session, and it is the server-side gate for every
 * upload: these are the checks that keep oversized or executable files out of
 * the database.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  validateAttachment,
  MAX_ATTACHMENT_BYTES,
} from "../lib/attachments-config.ts";

const bytes = (n: number) => Buffer.alloc(n, 1);

const valid = {
  fileName: "screenshot.png",
  contentType: "image/png",
  data: bytes(64),
};

describe("validateAttachment", () => {
  it("accepts a normal image", () => {
    assert.equal(validateAttachment(valid), null);
  });

  it("accepts a Uint8Array as well as a Buffer", () => {
    assert.equal(
      validateAttachment({ ...valid, data: new Uint8Array(64) }),
      null,
    );
  });

  it("rejects an empty file", () => {
    assert.match(validateAttachment({ ...valid, data: bytes(0) }) ?? "", /empty/i);
  });

  it("rejects a file over the limit", () => {
    const huge = { ...valid, data: bytes(MAX_ATTACHMENT_BYTES + 1) };
    assert.match(validateAttachment(huge) ?? "", /10 MB or smaller/i);
  });

  it("accepts a file exactly at the limit", () => {
    const exact = { ...valid, data: bytes(MAX_ATTACHMENT_BYTES) };
    assert.equal(validateAttachment(exact), null);
  });

  it("rejects a disallowed content type", () => {
    const html = { ...valid, fileName: "x.html", contentType: "text/html" };
    assert.match(validateAttachment(html) ?? "", /not supported/i);
  });

  it("rejects an executable", () => {
    const exe = {
      ...valid,
      fileName: "payload.exe",
      contentType: "application/x-msdownload",
    };
    assert.match(validateAttachment(exe) ?? "", /not supported/i);
  });

  it("rejects an overlong file name", () => {
    const long = { ...valid, fileName: `${"a".repeat(201)}.png` };
    assert.match(validateAttachment(long) ?? "", /name/i);
  });
});
