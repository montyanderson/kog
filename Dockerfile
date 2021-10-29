FROM denoland/deno

EXPOSE 6900

WORKDIR /app

USER deno

ADD . .

RUN deno test ./tests/*.ts

RUN deno cache index.ts

CMD ["run", "--allow-net", "--allow-env", "index.ts"]
