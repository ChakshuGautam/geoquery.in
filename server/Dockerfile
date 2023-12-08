FROM oven/bun

WORKDIR /usr/src/app

COPY . .

COPY ./package*.json ./bun.lockb ./
RUN bun install

ENV NODE_ENV production

CMD [ "bun", "start" ]

EXPOSE 3000