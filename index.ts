import { Item, NotFoundError } from "./lib/types.ts";
import createInMemoryStore from "./lib/createInMemoryStore.ts";
import createLog from "./lib/createLog.ts";
import createWebApi from "./lib/createWebApi.ts";
import sync from "./lib/sync.ts";

const store = createInMemoryStore();

const log = createLog({
	store
});

const app = createWebApi({
	log
});

app.listen({
	port: 6900
});


const nodes = Deno.env.get("KOG_NODES");

if(typeof nodes === "string") {
	for(;;) {
		await new Promise(resolve => {
			setTimeout(resolve, 5000);
		});
	
		await sync({
			log,
			nodes: nodes.split(",")
		});
	}
} else {
	console.warn("No sync nodes specified. Syncing disabled.");
}
