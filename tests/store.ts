import { assertEquals } from "../lib/deps.ts";
import createInMemoryStore from "../lib/createInMemoryStore.ts";

Deno.test("sets and gets", async () => {
	const store = createInMemoryStore();

	await store.set("foo", "bar");

	assertEquals(await store.get("foo"), "bar");
});

Deno.test("preserves type", async () => {
	const store = createInMemoryStore();

	await store.set("foo", true);

	assertEquals(typeof await store.get("foo"), "boolean");	
});
