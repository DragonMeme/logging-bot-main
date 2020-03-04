const Command = require("./commands.js");
const Database = require("./database.js");
const Discord = require("discord.js");

require("dotenv").config();

const client = new Discord.Client();
const prefix = process.env.PREFIX;
const author = String(process.env.AUTHOR_ID);

/*
    When the bot is set-up for the first time, a database is created.
    Otherwise refresh database by updating servers the bot is in.
*/
client.on("ready", async () => {
    client.user.setStatus("dnd");
    client.user.setActivity("Loading...",  "PLAYING");
    console.log("Loading bot!")

    Database.initDB(client);

    client.user.setStatus("available");
    client.user.setActivity(`type ${prefix}help`,  "PLAYING");

    console.log(`\nLogged in as ${client.user.tag}!`);
});

/*
    The main place to supposedly run commands by users.
*/
client.on("message", async (msg) => {
    // Check that the right prefix is used.
    if(!msg.content.startsWith(prefix)) return;

    // Avoid potential bot spam.
    if(msg.author.bot) return;

    // Assure that bot does not respond to commands until startup is done. 
    if(client.user.presence.status != "online") {

        // The bot owner is the only exception.
        if(msg.author.id != author) return;
    }

    Command.processCommand(msg, client);
});

/* 
    The bot that is invited to a guild must have more than 50 human members, 
    otherwise bot leaves guild automatically.
*/
client.on("guildCreate", async (guild) => {
    const guild_id = guild.id;
    console.log(`\nGuild ID ${guild_id} attempted to add bot to server.`);

    if(guild.members.filter(member => !member.user.bot).size < 50){

        // Only exception is when the server is owned by the bot author.
        if(guild.ownerID != author){
            guild.leave();

            // Do not perform SQL Query for the bot auto-leaving the guild.
            return;
        }
    }

    console.log(`\nAdding Guild of ID ${guild_id} to database.`);
    Database.createGuild([guild_id]);
});

/* 
    Ensure to remove the guild_setting of servers that the bot is kicked from.
    This is to ensure that the database space is conserved.
*/
client.on("guildDelete", async (guild) => {
    const guild_id = guild.id;

    // Ensure that when the bot auto-leaves, do not perform SQL Query.
    if(guild.members.filter(member => !member.user.bot).size < 50){
        if(guild.ownerID != author) return;
    }

    console.log(`\nRemoving Guild of ID ${guild_id} from database.`);
    Database.deleteGuild([guild_id]);
});

client.login(process.env.BOT_TOKEN).catch(error => console.log(error));
