import test from "node:test";
import assert from "node:assert/strict";
import { validateChatMessageContent } from "../src/middlewares/chatModeration.js";

test("accepts normal chat message", () => {
  const result = validateChatMessageContent("Hi, can you confirm shipping ETA?");
  assert.equal(result.ok, true);
});

test("rejects blocked terms", () => {
  const result = validateChatMessageContent("Send me your otp now");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "Message contains blocked content.");
});

test("rejects suspicious short links", () => {
  const result = validateChatMessageContent("check this offer bit.ly/superdeal");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "Message contains a suspicious link.");
});

test("rejects excessive repeated characters", () => {
  const result = validateChatMessageContent("heyyyyyyyyyyyyyyyyyyyyy");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "Message looks like spam due to repeated characters.");
});
