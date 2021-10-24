import { Store, NotFoundError } from "./types.ts";

export default (): Store => {
	const db: { [ key: string ]: any } = {};

	const get = async (key: string): Promise<void> => {
		const raw: any[string] = db[key];

		if(typeof db[key] !== "string") {
			throw new NotFoundError(`Key ${JSON.stringify(key)} not found`);
		}

		return JSON.parse(raw);
	};

	const set = async (key: string, value: any): Promise<void> => {
		db[key] = JSON.stringify(value);
	};

	const exists = async(key: string): Promise<boolean> => {
		return typeof db[key] === "string";
	};

	return { get, set, exists };
};
