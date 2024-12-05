FROM node:18-slim as base
RUN apt-get update -y && apt-get install -y openssl && apt-get install -y wget2 && apt-get install -y curl && apt-get install -y git

FROM base AS install
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base as build
WORKDIR /app
COPY prisma ./prisma/
COPY --from=install /app/node_modules ./node_modules
RUN npx prisma generate
COPY . .
RUN npm run build

FROM base as data
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .
COPY ./src ./src
RUN chmod +x ./setup.sh
RUN ./setup.sh

FROM base
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=data /app/db.mmdb ./db.mmdb
COPY --from=data /app/src ./src
COPY tsconfig.json ./tsconfig.json
EXPOSE 3000

CMD ["npm", "run", "migrate:ingest:start:prod"]