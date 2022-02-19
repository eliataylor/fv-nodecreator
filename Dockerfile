FROM node:16

MAINTAINER Eli Taylor eli@taylormadetraffic.com

WORKDIR /usr/src/nodecreator


COPY extra_packages ./
COPY package*.json ./
# COPY settings.json ./

RUN npm install

COPY . .

EXPOSE 1881

CMD ["npm", "start"]
