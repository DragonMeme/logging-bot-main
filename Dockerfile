# Ensure obtain node and the required files to start the bot.
FROM node:12-alpine
LABEL maintainer="DragonMeme 48312022+DragonMeme@users.noreply.github.com"
RUN apk update && apk upgrade && apk add python gcc g++ make

# Setup directory for running application and add files as required.
WORKDIR /home/user/app
RUN mkdir node_modules data && chown -R node:node .
COPY package.json .
USER node
RUN npm install --package-lock=false
COPY --chown=node:node . .

# Start the bot.
CMD [ "npm", "start" ]
