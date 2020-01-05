FROM node:latest

WORKDIR /usr
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "start" ]
