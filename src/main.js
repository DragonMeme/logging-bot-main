const { createData, deleteData, initialise, invalidGuildList, readData } = require("./database.js");
const { Client, Collection } = require("discord.js");
const { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require("fs");

const prefix = process.env.PREFIX;
const botAuthor = process.env.AUTHOR_ID;
const client = new Client();
client.commands = new Collection();

/*
    When the bot is set-up for the first time, a database is created.
    Otherwise refresh database by updating servers the bot is in.
    Ensure bot is only in servers that meet the pre-requisites.
*/
client.once("ready", async () => {
    await client.user.setPresence({
        game: { 
            name: "Loading..." 
        }, 
        status: "dnd"
    }); 
    console.log("==> Loading bot info and data!");
    if (!existsSync("./data")) mkdirSync("./data");
    readdirSync("./src/commands/").filter(file => file.endsWith(".js")).forEach(
        file => {
            const command = require(`./commands/${file}`);
            client.commands.set(command.name, command);
        }
    );
    console.log("=> Attempting to get bot invite link!");
    try{ 
        if(!JSON.parse(readFileSync("./data/config.json").toString()).invite) 
            throw Error("Missing Invite Link! Now it is being generated!");
        console.log("The stored invite link has been found.\n")
    }catch(e){
        await client.generateInvite(0x1000EC56).then(link => {
            writeFileSync("./data/config.json", JSON.stringify({invite: link}, null, 4));
            console.log("Invite link not found, but has been generated and stored!\n");
        }).catch(err => console.log(err.message));
    }
    initialise(client);
    await client.user.setPresence({
        game:{ 
            name: `${prefix}help | @${client.user.username} help` 
        }, 
        status: "online"
    });
    console.log(`==> Loaded and logged in as ${client.user.tag}!`);

    invalidGuildList().forEach(guildID => client.guilds.find(guild => guild.id === guildID).leave());
});

/*
    The main place to supposedly run commands by users.
    Also the most commonly occuring event for the bot to respond to.
*/
client.on("message", async (message) => {
    if(message.author.bot) return;

    // Ensure bot would respond either with prefix or with a proper mention.
    if(!message.content.match(new RegExp(`^(${prefix}|<@${client.user.id}> |<@!${client.user.id}> )`))) return;
    if(!["available", "online"].includes(client.user.presence.status)){
        if(message.author.id != botAuthor) return;
    }
    const startsWithPrefix = message.content.startsWith(prefix);
    const listVariables = message.content.toLowerCase().slice(prefix.length).split(" ");
    const firstArgument = startsWithPrefix ? listVariables[0] : listVariables[1];
    if(!client.commands.has(firstArgument)) return;
    const command = client.commands.get(firstArgument);
    const otherArguments = startsWithPrefix ? listVariables.slice(1) : listVariables.slice(2);
    switch(command.permissionLevel){
        case 0: // Normal User
        command.execute(message, otherArguments);
        break;

        case 1: // Moderator
        if(message.channel.type == "dm"){
            message.reply(`Sorry, command \`${firstArgument}\` is not supported in Direct Messages.`);
            return;
        }
        if(isModerator(message)) command.execute(message, otherArguments);
        else message.reply("You have insufficient permissions to run this command.");
        break;

        case 2: // Administrator
        if(message.channel.type == "dm"){
            message.reply(`Sorry, command \`${firstArgument}\` is not supported in Direct Messages.`);
            return;
        }
        if(isAdministrator(message)) command.execute(message, otherArguments);
        else message.reply("You have insufficient permissions to run this command.");
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
    console.log(`Guild ID ${guildID} attempted to add bot to server.`);
    if(guild.members.filter(member => !member.user.bot).size < 50){
        if(guild.ownerID != botAuthor){
            guild.leave();
            return; // Do not add guild to database.
        }
    }
    createData([guildID]);
});

/* 
    Ensure to remove the guild setting of servers that the bot is kicked from.
    This is to ensure that the database space is conserved.
*/
client.on("guildDelete", async (guild) => {
    const guildID = guild.id;
    console.log(`Left guild (ID: ${guildID})`);
    if(readData(guildID, "G") != null) deleteData([guildID]);
});

client.login(process.env.BOT_TOKEN).catch(error => console.log(error));

/*
    HELPER FUNCTIONS
*/
function isModerator(message){
    const member = message.guild.members.find(member => member.id === message.author.id);
    let permissionLevel = 0;
    if(member.hasPermission(0x2)) ++permissionLevel; // Kick Member
    if(member.hasPermission(0x4)) ++permissionLevel; // Ban Member
    if(member.hasPermission(0x2000)) ++permissionLevel; // Manage Messages
    if(member.hasPermission(0x8000000)) ++permissionLevel; // Manage Nicknames
    return permissionLevel > 2;
}

function isAdministrator(message){
    if(isModerator(message)){
        const member = message.guild.members.find(member => member.id === message.author.id);
        let permissionLevel = 0;
        if(member.hasPermission(0x8)) ++permissionLevel; // Administrator (not required)
        if(member.hasPermission(0x10)) ++permissionLevel; // Manage Channels
        if(member.hasPermission(0x20)) ++permissionLevel; // Manage Guild
        if(member.hasPermission(0x10000000)) ++permissionLevel; // Manage Roles
        return permissionLevel > 2;
    }else return false;
}
