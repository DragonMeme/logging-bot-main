const Command = require("./commands");
const Database = require("./database");
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

    console.log('\nLogged in as ' + client.user.tag + '!');
});

client.on('message', msg => {
    // Do not reply to any bot so avoid spam.
    if(msg.author.bot) return;

    // Check that the right prefix is used.
    if(!msg.content.startsWith(prefix)) return;

    // Assure that bot does not respond to commands until startup is done. The bot owner is the only exception.
    if(client.user.presence.status != 'online') {
        if(msg.author.id != process.env.AUTHOR_ID) return;
    }

    Command.processCommand(msg, prefix, client);
});

client.on('guildCreate', guild => {
    let guild_id = String(guild.id);

    console.log("\nAdding guild_id: " + guild_id + " to database.");
    Database.createGuild([guild_id]);
});

client.on('guildDelete', guild => {
    let guild_id = String(guild.id);

    console.log("\nRemoving guild_id: " + guild_id + " from database.");
    Database.deleteGuild([guild_id]);
});

client.login(process.env.BOT_TOKEN).catch(error => console.log(error));
