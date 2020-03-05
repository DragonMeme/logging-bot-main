const command = require("./commands.js");
const database = require("./database.js");
const discord = require("discord.js");

require("dotenv").config();

const client = new discord.Client();
const prefix = process.env.PREFIX;
const author = process.env.AUTHOR_ID;

/*
    When the bot is set-up for the first time, a database is created.
    Otherwise refresh database by updating servers the bot is in.
*/
client.on("ready", async () => {
    client.user.setStatus("dnd");
    client.user.setActivity("Loading...",  "PLAYING");
    console.log("Loading bot!")
    database.initDB(client);
    client.user.setStatus("available");
    client.user.setActivity(`type ${prefix}help`,  "PLAYING");
    console.log(`\nLogged in as ${client.user.tag}!`);
});

/*
    The main place to supposedly run commands by users.
*/
client.on("message", async (msg) => {
    if(!msg.content.startsWith(prefix)) return;
    if(msg.author.bot) return;
    if(client.user.presence.status != "online") {
        if(msg.author.id != author) {
            return;
        }
    }
    command.processCommand(msg, client);
});

/* 
    The bot that is invited to a guild must have more than 50 human members, 
    or has the bot owner as the owner of the guild, otherwise bot leaves 
    guild automatically.
*/
client.on("guildCreate", async (guild) => {
    const guildID = guild.id;
    console.log(`\nGuild ID ${guildID} attempted to add bot to server.`);
    if(guild.members.filter(member => !member.user.bot).size < 50){
        if(guild.ownerID != author){
            guild.leave();
            console.log(`Automatically left Guild (ID: ${guildID})`)
            return;
        }
    }
    database.createGuild([guildID]);
});

/* 
    Ensure to remove the guild setting of servers that the bot is kicked from.
    This is to ensure that the database space is conserved.
*/
client.on("guildDelete", async (guild) => {
    const guildID = guild.id;
    console.log(`\nLeft guild (ID: ${guildID})`)
    if(!database.readGuild(guildID, "G")){
        // Do not perform delete if guild id entry does not exist in database.
        return; 
    }
    database.deleteGuild([guildID]);
});

client.login(process.env.BOT_TOKEN).catch(error => console.log(error));
