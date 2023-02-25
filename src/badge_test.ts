import {
  assert,
  assertStringIncludes,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { createBadge } from "./badge.ts";

Deno.test({
  name: "badge",
  async fn() {
    const badge = await createBadge(1);
    assert(badge);
    assertStringIncludes(badge, '<svg xmlns="http://www.w3.org/2000/svg"');
  },
});
