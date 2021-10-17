import { Item, NotFoundError } from "./lib/types.ts";
import createInMemoryStore from "./lib/createInMemoryStore.ts";
import createLog from "./lib/createLog.ts";

(async () => {

	const store = createInMemoryStore();

	const log = createLog({
		store,
		views: {}
	});
	
})();
