FROM node:16

MAINTAINER Eli Taylor eli@taylormadetraffic.com

WORKDIR /

COPY ../node-red-contrib-refined-motion ./nodecreator/extra_packages

COPY package*.json ./
COPY settings.json ./

RUN npm install
EXPOSE 1881

CMD ["npm", "start"]
