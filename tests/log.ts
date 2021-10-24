import { assertEquals } from "../lib/deps.ts";
import createInMemoryStore from "../lib/createInMemoryStore.ts";
import createLog from "../lib/createLog.ts";

const createTestLog = () => createLog({
	store: createInMemoryStore()
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

	assertEquals(counters.length, 0);
});

Deno.test("inserts correctly", async () => {
	const log = createTestLog();

	await log.insert({
		counter: "three",
		$time: 500,
		$id: "random-id-1"
	});

	await log.push({
		counter: "four"
	});

	await log.push({
		counter: "five"
	})

	await log.insert({
		counter: "two",
		$time: 300,
		$id: "random-id-3"
	});

	await log.insert({
		counter: "one",
		$time: 100,
		$id: "random-id-2"
	});

	await log.insert({
		counter: "six",
		$time: Infinity,
		$id: "random-id-4"
	});

	const counters = [
		"one",
		"two",
		"three",
		"four",
		"five",
		"six"
	];

	for await (const item of log.list()) {
		assertEquals(item.counter, counters.shift());
	}

	assertEquals(counters.length, 0);

	const syncCounters = [
		"four",
		"five"
	];

	for await (const item of log.syncList()) {
		assertEquals(item.counter, syncCounters.shift());
	}

	assertEquals(syncCounters.length, 0);
});
