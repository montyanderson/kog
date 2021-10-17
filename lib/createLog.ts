import { Store, Item, Log, NotFoundError } from "./types.ts";

const createId = (): string => Math.random().toString().slice(2);

export default ({
	store,
	views
}: {
	store: Store,
	views: {
		[
			key: string 
		]:	any
	} 
}): Log => {
	const push = async (payload: object): Promise<void> => {
		const item: Item = {
			...payload,
			$id: createId(),
			$time: Date.now(),
			$next: null
		};
		
		await store.set(`item:${item.$id}`, item);

		try {
			const headId = await store.get("head");
			await store.set("head", item.$id);

			const head = await store.get(`item:${headId}`) as Item;
			head.$next = item.$id;
			
			await store.set(`item:${headId}`, head);
		} catch(error) {
			if(error instanceof NotFoundError) {
				await store.set("head", item.$id);
				await store.set("tail", item.$id);
			} else {
				throw error;
			}
		}
	}
	
	async function *list() {
		let id = await store.get("tail");

		while(id !== null) {
			const item = await store.get(`item:${id}`) as Item;

			yield item;

			id = item.$next;
		}
	};

	const view = async (id: string) => {
		const fn = views[id];

		let state = {};

		for await(const item of list()) {
			state = fn(item, state);
		}

		return state;
	}

	return { push, list, view };
};
