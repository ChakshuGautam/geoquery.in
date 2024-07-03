#FROM node:18.16.1-alpine
#
#COPY setup.sh
#
#RUN apk add --no-cache bash
#RUN npm i -g @nestjs/cli typescript ts-node
#
#COPY package*.json /tmp/app/
#RUN cd /tmp/app && npm install
#
#COPY . /usr/src/app
#RUN cp -a /tmp/app/node_modules /usr/src/app
#COPY ./wait-for-it.sh /opt/wait-for-it.sh
#COPY ./startup.dev.sh /opt/startup.dev.sh
#RUN sed -i 's/
#//g' /opt/wait-for-it.sh
#RUN sed -i 's/
#//g' /opt/startup.dev.sh
#
#WORKDIR /usr/src/app
#RUN cp env-example .env
#RUN npx prisma generate
#RUN npm run build
#
#CMD ["/opt/startup.dev.sh"]
#
#EXPOSE 3000


#FROM node:18.16.1-alpine
#
#WORKDIR /usr/src/app
#
#COPY . .
#
#RUN apt-get update && apt-get install -y curl && apt-get install -y git
#CMD /bin/bash
#COPY ./package*.json ./
#RUN ./setup.sh
#
#ENV NODE_ENV production
#CMD ["npm", "i"]
#CMD [ "npm", "run", "start:dev" ]
#
#EXPOSE 3000


FROM node:20.11.0-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install curl and git using apk
RUN apk update && apk add --no-cache curl git

RUN #npm config set registry http://registry.npmjs.org/

# Copy package files first for better caching of npm install
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run any additional setup script
RUN chmod +x ./setup.sh
RUN ./setup.sh

# Set environment variable
ENV NODE_ENV production

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:dev"]
