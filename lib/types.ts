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
	insert(item: RawItem): Promise<boolean>;
	list(): AsyncGenerator<any>;
	syncList(): AsyncGenerator<any>;

	getHead(): Promise<Item | null>;
	getItem(id: string): Promise<Item | null>;
	
	getSyncHead(): Promise<Item | null>;
	getSyncItem(id: string | null): Promise<Item | null>;
};
