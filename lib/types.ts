class NotFoundError extends Error {};

export { NotFoundError };

export interface Store {
	get(key: string): Promise<any>;
	set(key: string, value: any): Promise<void>;	
};

export interface Item {
	$id: string;
	$time: number;
	$next: string | null;
};

export interface Log {
	push(item: object): Promise<void>;
	list(): AsyncGenerator<any>;
	view(id: string): any;
};
