default:
	deno run --allow-net index.ts

test:
	deno test ./tests/*.ts

cluster:
	docker compose up --force-recreate --build
