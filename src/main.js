const Command = require("./commands");
const Database = require("./database")
const Discord = require("discord.js");

require("dotenv").config();

const client = new Discord.Client();
var prefix = process.env.PREFIX;

client.on('ready', () => {
    client.user.setStatus('dnd');
    client.user.setActivity("Loading...",  "PLAYING");
    console.log('Loading bot!')

    Database.initDB(client);

    client.user.setStatus('available');
    client.user.setActivity("type " + prefix + "help",  "PLAYING");

    console.log('Logged in as ' + client.user.tag + '!');
});

client.on('message', msg => {
    // Do not reply to any bot so avoid spam.
    if(msg.author.bot) return;

    // Check that the right prefix is used.
    if(!msg.content.startsWith(prefix)) return;

    Command.processCommand(msg, prefix, client);
});


client.login(process.env.BOT_TOKEN).catch(error => console.log(error));
