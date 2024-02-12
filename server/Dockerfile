FROM oven/bun

WORKDIR /usr/src/app

COPY . .

RUN apt-get update && apt-get install -y curl && apt-get install -y git
CMD /bin/bash
COPY ./package*.json ./bun.lockb ./
RUN ./setup.sh

ENV NODE_ENV production

CMD [ "bun", "start" ]

EXPOSE 3000