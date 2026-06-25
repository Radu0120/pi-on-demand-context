import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { resolveCdDir } from "./index.ts";

const HOME = "/home/radu";
const CWD = "/proj/app";

describe("resolveCdDir", () => {
  it("returns null for non-cd commands", () => {
    expect(resolveCdDir("ls -la", "", CWD, HOME)).toBeNull();
    expect(resolveCdDir("echo cd", "", CWD, HOME)).toBeNull();
  });

  it("bare `cd` goes home", () => {
    expect(resolveCdDir("cd", "", CWD, HOME)).toBe(HOME);
  });

  it("uses pwd output as the real dir", () => {
    expect(resolveCdDir("cd sub && pwd", "/proj/app/sub", CWD, HOME)).toBe("/proj/app/sub");
  });

  it("handles paths with spaces (the bug that bit us)", () => {
    const out = "/d/Projects/LLM Tests/qwen35b/tasktrack";
    expect(resolveCdDir("cd tasktrack && pwd", out, CWD, HOME)).toBe(out);
  });

  it("picks the last non-empty output line", () => {
    expect(resolveCdDir("cd x && pwd", "\n  /a/b  \n", CWD, HOME)).toBe("/a/b");
  });

  it("resolves a bare relative cd against the current dir", () => {
    expect(resolveCdDir("cd sub", "", CWD, HOME)).toBe(resolve(CWD, "sub"));
  });

  it("strips the `&& pwd` suffix from the target on the fallback path", () => {
    // No output -> falls back to resolve; target must NOT include "&& pwd"
    const got = resolveCdDir("cd sub && pwd", "", CWD, HOME)!;
    expect(got.endsWith("sub")).toBe(true);
    expect(got).not.toContain("pwd");
  });
});
