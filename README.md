# logging_bot_main
In this repository consists of my source code to hosting the bot. 

**WARNING:** Discontinued due to Discord Intents and Outdated Discord.JS module. Updating Discord.JS required re-vamping code base.

## Before starting
Pre-requisites:
* A C/C++ Compiler.
* Python V3+
* Node.js V12+

1.) Clone this repository.
```bash
git clone https://github.com/DragonMeme/logging-bot-main.git
```

2.) Add these variables to your `.env` file.
Ensure that you have a discord bot token, your discord account ID, prefix and your support server link.
```env
BOT_TOKEN=XXX
AUTHOR_ID=XXX
PREFIX=XXX
MAIN_SERVER_LINK=XXX
```

3.) Open your terminal on the repository file.

## Hosting your bot
### Local PC Method
1.) Run the following command to install all needed dependencies.
```bash
npm install
```
2.) After npm finishes installing run:
```bash
npm start
```

### Local Docker Container Method
1.) Run this in your terminal to start making an image.
```bash
docker build -t bot .
```

2.) After docker has finished creating your image, run this command to get a container ready for deployment.
```bash
# I prefer this method when running my image locally.
docker container run --rm --env-file=.env bot

# But if you want to create a container to use in a registry, you can use this command.
docker create --env-file=.env bot
```
