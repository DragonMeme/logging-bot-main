const { createData, deleteData, initialise, invalidGuildList, readData } = require("./database.js");
const { Client, Collection } = require("discord.js");
const { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require("fs");
const { logTime } = require("./common/logger.js");
const { isModerator, isAdministrator, isBotOwner, isGuildOwner } = require("./common/permissionCheck.js");

const prefix = process.env.PREFIX;
const client = new Client();
client.commands = new Collection();
let initialised = false;

/*
    When the bot is set-up for the first time, a database is created.
    Otherwise refresh database by updating servers the bot is in.
    Ensure bot is only in servers that meet the pre-requisites.
*/
client.on("ready", async () => {
    if(initialised){
        logTime(`==> Reconnected and ready as ${client.user.tag}`);
    }else{
        await client.user.setPresence({
            game: { 
                name: "Loading..." 
            }, 
            status: "dnd"
        }); 
        logTime("==> Loading bot info and data!");
        if (!existsSync("./data")) mkdirSync("./data");
        readdirSync("./src/commands/").filter(file => file.endsWith(".js")).forEach(
            file => {
                const command = require(`./commands/${file}`);
                client.commands.set(command.name, command);
            }
        );
        logTime("=>  Attempting to get bot invite link!");
        try{ 
            const configJSON = JSON.parse(readFileSync("./data/config.json").toString());
            if(!configJSON.invite) 
                throw Error("Missing Invite Link! Now it is being generated!");
            else{
                logTime("    The stored invite link has been found.");

                // Ensure invite link in config.json not tampered with/outdated.
                await client.generateInvite(0x1000EC56).then(link => {
                    if(link === configJSON.invite) logTime("    Invite link currently up-to-date!");
                    else{
                        writeFileSync("./data/config.json", JSON.stringify({invite: link}, null, 4));
                        logTime("    Invite link outdated, replaced with up-to-date link!");
                    }
                }).catch(err => logTime(err.message));
            }
        }catch(e){ // Unable to find JSON item.
            await client.generateInvite(0x1000EC56).then(link => {
                writeFileSync("./data/config.json", JSON.stringify({invite: link}, null, 4));
                logTime("    Invite link not found, but has been generated and stored!");
            }).catch(err => logTime(err.message));
        }
        initialise(client);
        await client.user.setPresence({
            game:{ 
                name: `${prefix}help | @${client.user.username} help` 
            }, 
            status: "online"
        });
        logTime(`==> Loaded and logged in as ${client.user.tag}!`);
        
        invalidGuildList().forEach(guildID => client.guilds.find(guild => guild.id === guildID).leave());
    }
});

/*
    The main place to supposedly run commands by users.
    Also the most commonly occuring event for the bot to respond to.
*/
client.on("message", async (message) => {
    if(message.author.bot) return undefined;

    // Ensure bot would respond either with prefix or with a proper mention.
    const prefixRegex = new RegExp(`^(${prefix}|<@${client.user.id}> |<@!${client.user.id}> )`);
    if(!message.content.match(prefixRegex)) return undefined;
    if(!["available", "online"].includes(client.user.presence.status)){
        if(!isBotOwner(message)) return undefined;
    }
    const startsWithPrefix = message.content.startsWith(prefix);
    const listVariables = message.content.toLowerCase().slice(prefix.length).split(" ");
    const firstArgument = startsWithPrefix ? listVariables[0] : listVariables[1];
    if(!client.commands.has(firstArgument)) return undefined;
    const command = client.commands.get(firstArgument);
    const otherArguments = startsWithPrefix ? listVariables.slice(1) : listVariables.slice(2);
    switch(command.permissionLevel){
        case 0: // Normal User
        return command.execute(message, otherArguments);

        case 1: // Moderator
        if(message.channel.type == "dm"){
            return message.reply(`Sorry, command \`${firstArgument}\` is not supported in Direct Messages.`);
        }
        if(isModerator(message)) return command.execute(message, otherArguments);
        else return message.reply("You have insufficient permissions to run this command.");

        case 2: // Administrator
        if(message.channel.type == "dm"){
            return message.reply(`Sorry, command \`${firstArgument}\` is not supported in Direct Messages.`);
        }
        if(isAdministrator(message)) return command.execute(message, otherArguments);
        else return message.reply("You have insufficient permissions to run this command.");

        case 3: // Bot Author
        if(isBotOwner(message)) return command.execute(message, otherArguments);

        default:
        return undefined;
    }
});

/* 
    The bot that is invited to a guild must have more than 50 human members, 
    or has the bot owner as the owner of the guild, otherwise bot leaves 
    guild automatically.
*/
client.on("guildCreate", async (guild) => {
    const guildID = guild.id;
    logTime(`    Guild ID ${guildID} attempted to add bot to server.`);
    if(guild.members.filter(member => !member.user.bot).size < 50){
        if(!isGuildOwner(guild, "owner")) return guild.leave(); // Do not add guild to database.
    }
    createData([guildID]);
});

/* 
    Ensure to remove the guild setting of servers that the bot is kicked from.
    This is to ensure that the database space is conserved.
*/
client.on("guildDelete", async (guild) => {
    const guildID = guild.id;
    logTime(`    Left guild (ID: ${guildID})`);
    if(readData(guildID, "G") != null) deleteData([guildID]);
});

client.on("userUpdate", (oldUser, newUser) => {
    if(newUser.id === client.user.id){
        if(oldUser.username !== newUser.username) client.user.setPresence({
            game:{ 
                name: `${prefix}help | @${newUser.username} help` 
            }
        }).then(() => {
            logTime(`    My username has been changed to ${client.user.username}`);
        });
    }
});

client.on("disconnect", () => logTime("==> I have disconnected!"));
client.on("error", error => logTime(error.message));
client.on("warn", info => logTime(info));

client.login(process.env.BOT_TOKEN).catch(error => logTime(error));