const Command = require("./commands");
const Database = require("./database");
const Discord = require("discord.js");

require("dotenv").config();

const client = new Discord.Client();
var prefix = process.env.PREFIX;

client.on('ready', async () => {
    client.user.setStatus('dnd');
    client.user.setActivity("Loading...",  "PLAYING");
    console.log('Loading bot!')

    Database.initDB(client);

    client.user.setStatus('available');
    client.user.setActivity("type " + prefix + "help",  "PLAYING");

    console.log('\nLogged in as ' + client.user.tag + '!');
});

client.on('message', async (msg) => {
    // Do not reply to any bot so avoid spam.
    if(msg.author.bot) return;

    // Check that the right prefix is used.
    if(!msg.content.startsWith(prefix)) return;

    // Assure that bot does not respond to commands until startup is done. 
    if(client.user.presence.status != 'online') {

        // The bot owner is the only exception.
        if(msg.author.id != process.env.AUTHOR_ID) return;
    }

    Command.processCommand(msg, prefix, client);
});

client.on('guildCreate', async (guild) => {
    let guild_id = guild.id;

    console.log("\nGuild_id: " + guild_id + " attempted to add bot to server.");

    // The bot that is invited to a guild must have more than 50 members.
    if(guild.members.filter(member => !member.bot).size < 50){

        // Only exception is when the server is owned by the author.
        if(guild.ownerID != process.env.AUTHOR_ID){
            guild.leave();

            // Do not perform any SQL Query for this.
            return;
        }
    }

    console.log("\nAdding guild_id: " + guild_id + " to database.");
    Database.createGuild([guild_id]);
});

client.on('guildDelete', async (guild) => {
    let guild_id = guild.id;

    if(guild.members.filter(member => !member.bot).size < 50){

        // Ensure that when the bot auto leaves, do not perform SQL Query.
        if(guild.ownerID != process.env.AUTHOR_ID){
            return;
        }
    }

    console.log("\nRemoving guild_id: " + guild_id + " from database.");
    Database.deleteGuild([guild_id]);
});

client.login(process.env.BOT_TOKEN).catch(error => console.log(error));
