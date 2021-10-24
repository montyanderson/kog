class NotFoundError extends Error {};

export { NotFoundError };

export interface Store {
	get(key: string): Promise<any>;
	set(key: string, value: any): Promise<void>;
	exists(key: string): Promise<boolean>;
};

export interface RawItem {
	$id: string;
	$time: number;
	[x: string]: any;
}

export interface Item extends RawItem {
	$next: string | null;
	$previous: string | null;
};

export interface Log {
	push(item: object): Promise<void>;
	insert(item: RawItem): Promise<void>;
	list(): AsyncGenerator<any>;
	syncList(): AsyncGenerator<any>;

	getHead(): Promise<Item>;
	getItem(id: string): Promise<Item>;
	
	getSyncHead(): Promise<Item>;
	getSyncItem(id: string): Promise<Item>;
};
