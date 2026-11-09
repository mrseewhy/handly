/**
 * Unit tests for the pure helpers that decide what the UI shows.
 *
 * Run with: npm test
 *
 * These import only dependency-free modules on purpose: the DAL is marked
 * `server-only` and needs a live session, so its behaviour is covered by the
 * integration checks described in docs/testing.md instead.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { makePage, parsePage, DEFAULT_PAGE_SIZE } from "../lib/pagination.ts";

describe("parsePage", () => {
  it("defaults to page 1", () => {
    assert.deepEqual(parsePage(undefined), {
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      offset: 0,
    });
  });

  it("computes offset from the page number", () => {
    const params = parsePage("3", 20);
    assert.equal(params.page, 3);
    assert.equal(params.offset, 40);
  });

  it("treats junk, zero and negatives as page 1", () => {
    for (const input of ["abc", "0", "-5", ""]) {
      assert.equal(parsePage(input).page, 1, `input: ${JSON.stringify(input)}`);
    }
  });

  it("clamps absurd page numbers so OFFSET cannot scan the table", () => {
    assert.equal(parsePage("999999999").page, 1_000);
  });

  it("accepts the array form Next.js can produce", () => {
    assert.equal(parsePage(["2", "5"]).page, 2);
  });
});

describe("makePage", () => {
  const params = { page: 2, pageSize: 10, offset: 10 };

  it("reports totals and page count", () => {
    const page = makePage([1, 2, 3], 25, params);
    assert.equal(page.total, 25);
    assert.equal(page.totalPages, 3);
    assert.equal(page.hasPrevious, true);
    assert.equal(page.hasNext, true);
  });

  it("never reports zero pages for an empty list", () => {
    const page = makePage([], 0, { page: 1, pageSize: 10, offset: 0 });
    assert.equal(page.totalPages, 1);
    assert.equal(page.hasNext, false);
    assert.equal(page.hasPrevious, false);
  });

  it("knows when it is on the last page", () => {
    const page = makePage([1], 21, { page: 3, pageSize: 10, offset: 20 });
    assert.equal(page.hasNext, false);
    assert.equal(page.hasPrevious, true);
  });
});
