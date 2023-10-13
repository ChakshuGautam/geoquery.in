FROM oven/bun

WORKDIR /usr/src/app

COPY ./server .

COPY ./server/package*.json ./server/bun.lockb ./
RUN bun install

ENV NODE_ENV production

CMD [ "bun", "start" ]

EXPOSE 3000