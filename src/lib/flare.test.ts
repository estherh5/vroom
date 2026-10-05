import { describe, expect, it } from "vitest";
import { boundContext, buildPayload, errorDetail } from "./flare";

/**
 * WHAT AN ERROR CARRIES ON ITSELF HAS TO REACH FLARE.
 *
 * Ported from flare/test/reporter-error-detail.test.ts against this app's port
 * of the reporter, which check-reporters.mjs does not compare.
 *
 * The defect these pin is silent by construction: the reporter built a payload
 * from `name`/`message`/`stack`, every app kept throwing richly-typed errors,
 * and flare kept storing one sentence. Nothing was ever red — the report went
 * out, the row appeared, and the field that would have told triage which bug it
 * was had been dropped one function earlier.
 *
 * The live case: glimpse's `AudioEncodeFailedError` wraps a WebCodecs failure
 * and appends the audio config as `params`, `descriptionBytes` among them. That
 * number is the whole difference between "the AAC config never reached the
 * decoder again" and "something new". It was on the thrown error and not in the
 * report.
 */

/**
 * `new Error(message, { cause })` is ES2022 and this app's TS lib is ES2020, so the
 * cause is attached by hand. The reporter reads the same `cause` property
 * either way.
 */
function withCause(message: string, cause: unknown): Error {
  return Object.assign(new Error(message), { cause });
}

/** The shape the app throws: a friendly message over a real cause, plus config. */
class WrappedError extends Error {
  readonly params: Record<string, unknown>;
  readonly cause: unknown;
  constructor(cause: unknown, params: Record<string, unknown>) {
    super("The clip's own sound could not be re-encoded.");
    this.name = "AudioEncodeFailedError";
    this.cause = cause;
    this.params = params;
  }
}

describe("an error's own diagnosis reaches the payload", () => {
  it("carries `params` and the cause chain into context, beside the caller's own keys", () => {
    const err = new WrappedError(new Error("InternalAudioDecoderCocoa decoding failed"), {
      codec: "mp4a.40.2",
      sampleRate: 44100,
      numberOfChannels: 1,
      descriptionBytes: 0,
      samples: 422,
    });

    const payload = buildPayload(err, { kind: "client", where: "renderClip", stabilize: true });

    // The screen's sentence is still the message — this does not change what a
    // person reads, only what triage receives.
    expect(payload.message).toBe("The clip's own sound could not be re-encoded.");
    expect(payload.name).toBe("AudioEncodeFailedError");

    const ctx = payload.context!;
    // The caller's context is untouched…
    expect(ctx.where).toBe("renderClip");
    expect(ctx.stabilize).toBe(true);
    // …`kind` and `url` are still lifted out of it rather than duplicated…
    expect(ctx.kind).toBeUndefined();
    // …and the error's own two payloads are now there.
    expect(ctx._params).toEqual({
      codec: "mp4a.40.2",
      sampleRate: 44100,
      numberOfChannels: 1,
      descriptionBytes: 0,
      samples: 422,
    });
    expect(ctx._cause).toEqual([
      { name: "Error", message: "InternalAudioDecoderCocoa decoding failed" },
    ]);
  });

  it("follows a chain, bounded at three, and never loops on a cycle", () => {
    const a = new Error("a");
    const b = withCause("b", a);
    const c = withCause("c", b);
    const d = withCause("d", c);
    const top = withCause("top", d);

    expect(errorDetail(top)._cause).toEqual([
      { name: "Error", message: "d" },
      { name: "Error", message: "c" },
      { name: "Error", message: "b" },
    ]);

    // A cycle terminates rather than filling the bound with one repeated link.
    const loop = new Error("loop");
    (loop as Error & { cause?: unknown }).cause = loop;
    expect(errorDetail(loop)._cause).toEqual([{ name: "Error", message: "loop" }]);
  });

  it("keeps a cause's STACK out — it is the same minified chunk, at context's expense", () => {
    const cause = new Error("boom");
    const detail = errorDetail(withCause("wrapped", cause));
    expect(JSON.stringify(detail)).not.toContain("stack");
    expect(JSON.stringify(detail)).not.toContain(".js:");
  });

  it("adds nothing at all to a plain error, so an ordinary report is byte-identical", () => {
    expect(errorDetail(new Error("plain"))).toEqual({});
    expect(buildPayload(new Error("plain")).context).toBeNull();
    expect(buildPayload(new Error("plain"), { where: "x" }).context).toEqual({ where: "x" });
  });

  it("ignores a `params` that is not a plain object — that name belongs to callers too", () => {
    const arr = Object.assign(new Error("e"), { params: [1, 2, 3] });
    const str = Object.assign(new Error("e"), { params: "not a payload" });
    expect(errorDetail(arr)._params).toBeUndefined();
    expect(errorDetail(str)._params).toBeUndefined();
  });

  it("is still bounded: an oversized `params` is DISCARDED with a marker, never truncated", () => {
    const huge = new WrappedError(new Error("c"), { blob: "x".repeat(20_000) });
    const ctx = buildPayload(huge, { where: "renderClip" }).context!;
    // The marker, not a clipped string — a truncated JSON context is unparseable
    // and strictly worse than none.
    expect(typeof ctx._flareDiscarded).toBe("string");
    expect(ctx._params).toBeUndefined();
    // And `boundContext` is what decided that, not `errorDetail`.
    expect(errorDetail(huge)._params).toBeDefined();
    expect(boundContext({ ok: 1 })).toEqual({ ok: 1 });
  });
});
