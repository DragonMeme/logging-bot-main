const { createData, deleteData, initialise, invalidGuildList, readData } = require("./database.js");
const { Client, Collection } = require("discord.js");
const { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require("fs");
const { consoleLogTime } = require("./common/logger.js");
const { isModerator, isAdministrator, isBotOwner, isGuildOwner } = require("./common/permission_check.js");

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
	if(initialised)consoleLogTime(`==> Reconnected and ready as ${client.user.tag}`);
	else{
		await client.user.setPresence({
			game: {
				name: "Loading..."
			},
			status: "dnd"
		});
		consoleLogTime("==> Loading bot info and data!");
		if (!existsSync("./data")) mkdirSync("./data");
		readdirSync("./src/commands/").filter(file => file.endsWith(".js")).forEach(
			file => {
				const command = require(`./commands/${file}`);
				client.commands.set(command.name, command);
			}
		);
		consoleLogTime("=>  Attempting to get bot invite link!");
		try{
			const configJSON = JSON.parse(readFileSync("./data/config.json").toString());
			if(!configJSON.invite) throw Error("Missing Invite Link! Now it is being generated!");
			else{
				consoleLogTime("The stored invite link has been found.");

				// Ensure invite link in config.json not tampered with/outdated.
				await client.generateInvite(0x1000EC56).then(link => {
					if(link === configJSON.invite) consoleLogTime("Invite link currently up-to-date!");
					else{
						writeFileSync("./data/config.json", JSON.stringify({invite: link}, null, 4));
						consoleLogTime("Invite link outdated, replaced with up-to-date link!");
					}
				}).catch(err => consoleLogTime(err.message));
			}
		}catch(e){ // Unable to find JSON item.
			await client.generateInvite(0x1000EC56).then(link => {
				writeFileSync("./data/config.json", JSON.stringify({invite: link}, null, 4));
				consoleLogTime("Invite link not found, but has been generated and stored!");
			}).catch(err => consoleLogTime(err.message));
		}
		initialise(client);
		await client.user.setPresence({
			game:{
				name: `${prefix}help | @${client.user.username} help`
			},
			status: "online"
		});
		consoleLogTime(`==> Loaded and logged in as ${client.user.tag}!`);

		invalidGuildList().forEach(guildID => client.guilds.find(guild => guild.id === guildID).leave());
		initialised = true;
	}
});

/*
    The main place to supposedly run commands by users.
    Also the most commonly occuring event for the bot to respond to.
*/
client.on("message", async (message) => {
	if(message.author.bot) return;
	if(!["available", "online"].includes(client.user.presence.status)) if(!isBotOwner(message)) return;
	if(message.channel.type === "text"){// DM user inability to send messages in said channel.
		if(!message.channel.permissionsFor(client.user.id).has("SEND_MESSAGES")){
			const channelID = message.channel.id;
			message.author.send(`Missing permission \`SEND MESSAGES\` in <#${channelID}>, please grant me it!`)
				.catch(); // Case that both the channel and author DMs unavailable.
		}
	}
	// Ensure bot would respond either with prefix or with a proper mention.
	const content = message.content.trim();
	const prefixRegex = new RegExp(`^(${prefix}|<@${client.user.id}> |<@!${client.user.id}> )`);
	if(!content.match(prefixRegex)) return;

	const startsWithPrefix = message.content.startsWith(prefix);
	const listVariables = content.slice(prefix.length).split(/\s+/);
	const firstArgument = startsWithPrefix ? listVariables[0].toLowerCase() : listVariables[1].toLowerCase();
	if(!client.commands.has(firstArgument)) return;
	const command = client.commands.get(firstArgument);
	const otherArguments = startsWithPrefix ? listVariables.slice(1) : listVariables.slice(2);
	switch(command.permissionLevel){
		case 0: // Normal User
			command.execute(message, otherArguments);
			break;

		case 1: // Moderator
			if(message.channel.type === "dm"){
				message.reply(`Sorry, command \`${firstArgument}\` is not supported in Direct Messages.`);
			}
			if(isModerator(message.member)) command.execute(message, otherArguments);
			else message.reply("You have insufficient permissions to run this command.");
			break;

		case 2: // Administrator
			if(message.channel.type === "dm"){
				message.reply(`Sorry, command \`${firstArgument}\` is not supported in Direct Messages.`);
			}
			if(isAdministrator(message.member)) command.execute(message, otherArguments);
			else message.reply("You have insufficient permissions to run this command.");
			break;

		case 3: // Bot Author
			if(isBotOwner(message.author)) command.execute(message, otherArguments);
			break;

		default:
	}
});

/*
    The bot that is invited to a guild must have more than 50 human members,
    or has the bot owner as the owner of the guild, otherwise bot leaves
    guild automatically.
*/
client.on("guildCreate", async (guild) => {
	const guildID = guild.id;
	consoleLogTime(`Guild ID ${guildID} attempted to add bot to server.`);
	if(guild.members.filter(member => !member.user.bot).size < 50){ // Do not add guild to database.
		if(!isGuildOwner(guild, "owner")) return guild.leave();
	}
	return createData([guildID]);
});

/*
    Ensure to remove the guild setting of servers that the bot is kicked from.
    This is to ensure that the database space is conserved.
*/
client.on("guildDelete", async (guild) => {
	const guildID = guild.id;
	consoleLogTime(`Left guild (ID: ${guildID})`);
	if(readData(guildID, "G")) deleteData([guildID]);
});

/*
	Ensure that when the client updates its username, its mention in the game status
	is also set accordingly.
*/
client.on("userUpdate", async (oldUser, newUser) => {
	if(newUser.id === client.user.id){
		if(oldUser.username !== newUser.username){
			client.user.setPresence({
				game: { name: `${prefix}help | @${newUser.username} help` }
			}).then(() => {
				consoleLogTime(`My username has been changed to ${client.user.username}`);
			});
		}
	}
});

client.on("debug", async (info) => consoleLogTime(info));
client.on("disconnect", async () => consoleLogTime("==> I have disconnected!"));
client.on("error", async (error) => consoleLogTime(error.message));
client.on("warn", async (info) => consoleLogTime(info));

client.login(process.env.BOT_TOKEN).catch(error => consoleLogTime(`${error}`));
