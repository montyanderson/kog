import { App, ServerRequest, createApp } from "https://deno.land/x/servest@v1.3.1/mod.ts";

import { Log } from "./types.ts";

const respondJson = async (req: ServerRequest, body: any) => {
	await req.respond({
		status: 200,
		headers: new Headers({
			"content-type": "application/json"
		}),
		body: JSON.stringify(body)
	});
};

const respondSuccess = async (req: ServerRequest) => {
	await req.respond({
		status: 200
	});
};

export default ({ log }: { log: Log }): App => {
	const app = createApp();

	app.post("/push", async req => {
		const item = await req.json();
		await log.push(item);

		await respondSuccess(req);
	});

	app.get("/item", async req => {
		const head = await log.getHead();

		await respondJson(req, head);
	});

	app.get(new RegExp("^/item/(.+)"), async req => {
		const [_, id] = req.match;
		const item = await log.getItem(id);

		await respondJson(req, item);
	});

	app.get("/sync", async req => {
		const syncHead = await log.getSyncHead();

		await respondJson(req, syncHead);
	});

	app.get(new RegExp("^/sync/(.+)"), async req => {
		const [_, id] = req.match;
		const syncItem = await log.getSyncItem(id);

		await respondJson(req, syncItem);
	});

	return app;
}
