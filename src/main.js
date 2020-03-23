const database = require("./database.js");
const discord = require("discord.js");
const fs = require("fs");

require("dotenv").config();
const prefix = process.env.PREFIX;
const botAuthor = process.env.AUTHOR_ID;

const client = new discord.Client();
client.commands = new discord.Collection();
fs.readdirSync("./src/commands/").filter(file => file.endsWith(".js")).forEach(
    file => {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
);


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
client.on("message", async (message) => {
    if(message.channel.type != "text") return;
    if(!message.content.startsWith(prefix)) return;
    if(message.author.bot) return;
    if(client.user.presence.status != "available") {
        if(message.author.id != author) return;
    }
    const listVariables = message.content.toLowerCase().slice(prefix.length).split(" ");
    const firstArgument = listVariables[0]; // Main argument
    if(!client.commands.has(firstArgument)) return;
    const command = client.commands.get(firstArgument);
    const otherArguments = listVariables.slice(1);
    switch(command.permissionLevel){
        case 0: // Normal User
        command.execute(message, otherArguments);
        break;

        case 1: // Moderator
        if(isModerator(message)) command.execute(message, otherArguments);
        else message.channel.send(`<@${message.author.id}>, You have insufficient permissions to run this command.`);
        break;

        case 2: // Administrator
        if(isAdministrator(message)) command.execute(message, otherArguments);
        else message.channel.send(`<@${message.author.id}>, You have insufficient permissions to run this command.`);
        break;

        case 3: // Bot Author
        if(message.author.id == botAuthor) command.execute(message, otherArguments);
        break;

        default:
        return;
    }
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
            return; // Do not add guild to database.
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
    if(!database.readGuild(guildID, "G")) return; 
    database.deleteGuild([guildID]);
});

client.login(process.env.BOT_TOKEN).catch(error => console.log(error));

function isModerator(message){
    const member = message.guild.members.find(member => member.id === message.author.id);
    let permissionLevel = 0;
    if(member.hasPermission(0x2)) permissionLevel++; // Kick Member
    if(member.hasPermission(0x4)) permissionLevel++; // Ban Member
    if(member.hasPermission(0x2000)) permissionLevel++; // Manage Messages
    if(member.hasPermission(0x8000000)) permissionLevel++; // Manage Nicknames
    return permissionLevel > 2;
}

function isAdministrator(message){
    if(isModerator(message)){
        const member = message.guild.members.find(member => member.id === message.author.id);
        let permissionLevel = 0;
        if(member.hasPermission(0x8)) permissionLevel++; // Administrator (not required)
        if(member.hasPermission(0x10)) permissionLevel++; // Manage Channels
        if(member.hasPermission(0x20)) permissionLevel++; // Manage Guild
        if(member.hasPermission(0x10000000)) permissionLevel++; // Manage Roles
        return permissionLevel > 2;
    }else return false;
}
