import { Store, RawItem, Item, Log, NotFoundError } from "./types.ts";

const createId = (): string => Math.random().toString().slice(2);

export default ({
	store,
}: {
	store: Store
}): Log => {
	async function push(payload: object): Promise<void> {
		const item: RawItem = {
			...payload,
			$id: createId(),
			$time: Date.now(),
		};
		
		await store.set(`item:${item.$id}`, item);

		try {
			// try and get current head
			const headId = await store.get("meta:head");
			// set new item as head and as next
			await store.set("meta:head", item.$id);
			await store.set(`next:${headId}`, item.$id);
			await store.set(`previous:${item.$id}`, headId);
		} catch(error) {
			if(error instanceof NotFoundError) {
				// if current head not set, set as head and tail
				await store.set("meta:head", item.$id);
				await store.set("meta:tail", item.$id);
			} else {
				throw error;
			}
		}

		try {
			// get sync head
			const syncHeadId = await store.get("meta:sync-head");
			// set new item as sync head and next
			await store.set("meta:sync-head", item.$id);
			await store.set(`sync-next:${syncHeadId}`, item.$id);
			await store.set(`sync-previous:${item.$id}`, syncHeadId);
		} catch(error) {
			if(error instanceof NotFoundError) {
				await store.set("meta:sync-head", item.$id);
				await store.set("meta:sync-tail", item.$id);
			} else {
				throw error;
			}
		}
	};

	async function getItem(id: string): Promise<Item | null> {
		if(id === null) {
			return null;
		}

		const item = await store.get(`item:${id}`) as RawItem;

		const $next = await store.exists(`next:${id}`)
			? await store.get(`next:${id}`)
			: null;
			
		const $previous = await store.exists(`previous:${id}`)
			? await store.get(`previous:${id}`)
			: null;

		return {
			...item,
			$next,
			$previous
		};
	};

	async function getHead(): Promise<Item | null> {
		if(await store.exists("meta:head") === false) {
			return null;
		}

		return getItem(await store.get("meta:head"));
	};

	async function getTail(): Promise<Item | null> {
		if(await store.exists("meta:tail") === false) {
			return null;
		}
	
		return getItem(await store.get("meta:tail"));
	}

	async function getSyncItem(id: string): Promise<Item | null> {
		if(await store.exists(`item:${id}`) === false) {
			return null;
		}
	
		const item = await store.get(`item:${id}`) as RawItem;

		const $next = await store.exists(`sync-next:${id}`)
			? await store.get(`sync-next:${id}`)
			: null;
			
		const $previous = await store.exists(`sync-previous:${id}`)
			? await store.get(`sync-previous:${id}`)
			: null;

		return {
			...item,
			$next,
			$previous
		};
	};

	async function getSyncHead(): Promise<Item | null> {
		if(await store.exists("meta:sync-head") === false) {
			return null;
		}
	
		return getItem(await store.get("meta:sync-head"));
	};

	async function getSyncTail(): Promise<Item | null> {
		if(await store.exists("meta:sync-tail") === false) {
			return null;
		}
	
		return getItem(await store.get("meta:sync-tail"));
	}

	async function *list() {
		let item = await getTail();

		while(item !== null) {
			yield item;
		
			item = await getItem(item.$next as string);
		}
	};

	async function *syncList() {
		let item = await getSyncTail();
		
		while(item !== null) {
			yield item;

			item = await getSyncItem(item.$next as string);
		}
	}

	async function *listBackwards() {
		let item = await getHead();

		while(item !== null) {
			yield item;
		
			item = await getItem(item.$previous as string);
		}
	}

	async function insert(item: RawItem): Promise<boolean> {
		if(await store.exists(`item:${item.$id}`) === true) {
			return false;
		}
	
		// store item
		await store.set(`item:${item.$id}`, item);
	
		// insert as head and tail if log empty
		if((await store.exists("meta:head")) === false) {
			await store.set("meta:head", item.$id);
			await store.set("meta:tail", item.$id);

			return true;
		}
	
		for await (const previous of listBackwards()) {
			// if created after, insert on top
			if(item.$time > previous.$time) {
				if(previous.$next === null) {
					await store.set("meta:head", item.$id);
				} else {
					await store.set(`next:${item.$id}`, previous.$next);
				}

				await store.set(`previous:${item.$id}`, previous.$id);
				await store.set(`next:${previous.$id}`, item.$id);

				return true;
			}
		} 

		// time is less than all previous items, insert at tail
		await store.set(`next:${item.$id}`, await store.get("meta:tail"));
		await store.set(`previous:${await store.get("meta:tail")}`, item.$id);
		
		await store.set("meta:tail", item.$id);

		return true;
	}

	return {
		push,
		list,
		syncList,
		insert,
		getHead,
		getItem,
		getSyncHead,
		getSyncItem
	};
};
