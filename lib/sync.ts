import { Log, Item } from "./types.ts";

const fetchHead = async (node: string): Promise<Item | null> => {
	const response = await fetch(`${node}/item`);

	return await response.json() as Item | null;
};

const fetchItem = async (node: string, item: string): Promise<Item | null> => {
	const response = await fetch(`${node}/item/${item}`);

	return await response.json() as Item | null;
};

const syncNode = async ({ log, node }: { log: Log, node: string }) => {
	let isNew: boolean = false;
	let item: Item | null;

	do {
		item = await fetchHead(node);

		if(item === null) {
			return;
		}

		isNew = await log.insert(item);

		if(isNew === true) {
			console.log("found new item!", { item });
		}
	} while(isNew === true) {
		if(typeof item.$next !== "string") {
			return;
		}
	
		item = await fetchItem(node, item.$next);

		if(item === null) {
			return;
		}
		
		isNew = await log.insert(item);

		if(isNew === true) {
			console.log("found new item!", { item });
		}
	}
};

export default async ({ log, nodes }: { log: Log, nodes: string[] }) => {
	console.log("Syncing", { nodes });

	await Promise.all(nodes.map(node =>
		syncNode({log, node })
	));
};
