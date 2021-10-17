import { assertEquals } from "../lib/deps.ts";
import createInMemoryStore from "../lib/createInMemoryStore.ts";
import createLog from "../lib/createLog.ts";

const createTestLog = () => createLog({
	store: createInMemoryStore(),
	views: {}
});

Deno.test("pushes and lists", async () => {
	const log = createTestLog();

	await log.push({ counter: "one" });
	await log.push({ counter: "two" });
	await log.push({ counter: "three" });

	const counters = [
		"one",
		"two",
		"three"
	];

	for await (const item of log.list()) {
		assertEquals(item.counter, counters.shift());
	}
});
