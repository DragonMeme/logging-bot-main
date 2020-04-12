const { createData, deleteData, initialise, invalidGuildList, readData, readDataRow, updateData } = require("./database.js");
const { Client, Collection, RichEmbed, Attachment } = require("discord.js");
const { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require("fs");
const { generateSetLogParameters } = require("./common/guild_setting.js");
const { SettingValues } = require("./common/guild_setting.json");
const { consoleLogTime, getUTCTimeStamp } = require("./common/logger.js");
const { isModerator, isAdministrator, isBotOwner, isGuildOwner } = require("./common/permission_check.js");

const prefix = process.env.PREFIX;
const client = new Client();
client.commands = new Collection();
const loggingTypes = generateSetLogParameters;
const keySettingValues = Object.keys(SettingValues);
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

		invalidGuildList().forEach(guildID => client.guilds.get(guildID).leave());
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
	Message Deletes should trigger the bot to post message deletes on the logging channel.
	Most of the error handling here are handled by channel updates.
	The error handling here is for just in case the bot is down when users change permissions.
*/
client.on("messageDelete", async (message) => {
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
	const targetChannelID = readData(message.guild.id, "UMD");
	const updateObject = [[message.guild.id, "UMD", null]]; // Object to send to DB to on failure to log message_delete.
	if(targetChannelID){
		const targetChannel = message.guild.channels.get(targetChannelID);
		const botPermissions = targetChannel.permissionsFor(message.guild.me);
		if(botPermissions.has(["VIEW_CHANNEL", "SEND_MESSAGES"])){
			if(botPermissions.has("EMBED_LINKS")){ // Ensure can post embeds.
				const embed = new RichEmbed()
					.setTitle("🗑️ **__Deleted Message__** 🗑️")
					.addField("**Author**", `<@${message.author.id}>`, true)
					.addField("**Channel**", `<#${message.channel.id}>`, true)
					.addField("**Created Timestamp**", `\`${getUTCTimeStamp(message.createdAt)}\``)
					.addField("**Message Content**", message.content)
					.setFooter(`Deleted Timestamp: ${getUTCTimeStamp(Date.now())}`);
				targetChannel.send(embed);
			}else{
				updateData(updateObject);
				const messageString = "I require permission `EMBED_LINKS` to post `message_delete` logs." +
					"I have disabled logging this for now, you will have to re-enable this setting.";
				targetChannel.send(messageString);
			}
		}else{ // In the case the bot does not have permission to post in said channel.
			updateData(updateObject);
		}
	}else{ // Case channel does not exist.
		updateData(updateObject);
	}
});

/*
	Message Updates should trigger the bot to post message updates on the logging channel.
	Most of the error handling here are handled by channel updates.
	The error handling here is for just in case the bot is down when users change permissions.
*/
client.on("messageUpdate", async (oldMessage, newMessage) => {
	if(oldMessage.author.bot) return;
	if(oldMessage.channel.type === "dm") return;
	const targetChannelID = readData(oldMessage.guild.id, "UME");
	const updateObject = [[oldMessage.guild.id, "UME", null]]; // Object to send to DB on failure to log message_edit.
	if(targetChannelID){
		const targetChannel = newMessage.guild.channels.get(targetChannelID);
		const botPermissions = targetChannel.permissionsFor(newMessage.guild.me);
		if(oldMessage.cleanContent === newMessage.cleanContent) return;
		if(botPermissions.has(["VIEW_CHANNEL", "SEND_MESSAGES"])){
			if(botPermissions.has("EMBED_LINKS")){ // Ensure can post embeds.
				const embed = new RichEmbed()
					.setTitle("📝 **__Edited Message__** 📝")
					.setURL(oldMessage.url)
					.addField("**Author**", `<@${oldMessage.author.id}>`, true)
					.addField("**Channel**", `<#${oldMessage.channel.id}>`, true)
					.addField("**Created Timestamp**", `\`${getUTCTimeStamp(oldMessage.createdAt)}\``)
					.addField("**Old Message Content**", oldMessage.content)
					.addField("**New Message Content**", newMessage.content)
					.setFooter(`Edited Timestamp: ${getUTCTimeStamp(newMessage.editedAt)}`);
				targetChannel.send(embed);
			}else{
				updateData(updateObject);
				const messageString = "I require permission `EMBED_LINKS` to post `message_edit` logs." +
					"I have disabled logging this for now, you will have to re-enable this setting.";
				targetChannel.send(messageString);
			}
		}else{ // In the case the bot does not have permission to post in said channel.
			updateData(updateObject);
		}
	}else{
		updateData(updateObject);
	}
});

/*
	Message Bulk Deletes should trigger the bot to post bulk message deletes on the logging channel.
	Most of the error handling here are handled by channel updates.
	The error handling here is for just in case the bot is down when users change permissions.
*/
client.on("messageDeleteBulk", async (messages) => {
	const informationMessage = messages.random();
	const guildID = informationMessage.guild.id;
	const targetChannelID = readData(guildID, "BD");
	if(!targetChannelID) return; // Do not perform operation if unset.

	const channelID = informationMessage.guild.id;
	const targetChannel = informationMessage.guild.channels.get(targetChannelID);
	const updateObject = [[guildID, "BD", null]]; // Object to send to DB on failure to log bulk_delete
	if(targetChannel){ // Target channel exists
		const botAsMember = informationMessage.guild.me;
		const botPermissions = targetChannel.permissionsFor(botAsMember);
		if(botPermissions.has(["VIEW_CHANNEL", "SEND_MESSAGES"])){
			const currentPermissions = [ // Reduce the amount of times to call checking for permissions.
				botPermissions.has("ATTACH_FILES"), botPermissions.has("EMBED_LINKS")
			];
			if(currentPermissions[0] && currentPermissions[1]){ // Can embed links and attach files
				const channelIDPath = `./data/${guildID}/${channelID}`;
				const sortedMessages = messages.sort((m1, m2) => m1.createdTimestamp - m2.createdTimestamp);
				if(!existsSync(channelIDPath)){
					mkdirSync(`./data/${guildID}`);
					mkdirSync(channelIDPath);
				}
				const textFilePath = `${channelIDPath}/deleted.txt`;
				writeFileSync(textFilePath, "Mass deleted messages dump:\n");
				sortedMessages.forEach(message => {
					const timeStamp = getUTCTimeStamp(message.createdTimestamp);
					const authorID = message.author.id;
					const authorTag = message.author.tag;
					const content = message.content;
					appendFileSync(textFilePath, `${timeStamp} <@${authorID}> ${authorTag}:\n${content}\n\n`);
				});
				const embed = new RichEmbed()
					.setTitle("♻️ **__Bulk Message Delete__** ♻️")
					.setDescription("Message content is dumped in the attached text file.")
					.addField("Channel", `<#${informationMessage.channel.id}>`)
					.addField("Amount deleted", messages.size)
					.setFooter(`Mass Deleted Timestamp: ${getUTCTimeStamp(Date.now())}`);
				targetChannel.send({
					embed: embed,
					files: [new Attachment(textFilePath)]
				});
			}else{ // Missing either ATTACH_FILES and EMBED_LINKS permission for the bot to use logging channel.
				updateData(updateObject);
				const messageString = "I require permission" + // At least one of the permissions are missing.
					(currentPermissions.filter(p => !p).length === 1 ? "" : "s") + // Grammer for singular false permissions
					(currentPermissions[0] ? " `EMBED_LINKS`" : " `ATTACH_FILES`") +
					(currentPermissions[1] ? "" : " and `EMBED_LINKS`") +
					" to post `bulk_delete` logs." +
					"I have disabled logging this for now, you will have to re-enable this setting.";
				targetChannel.send(messageString);
			}
		}else{ // When bot is unable to send message to channel / view channel
			updateData(updateObject);
			const errorMessage = `Cannot log \`bulk_delete\` logs to <#${targetChannelID}> as I do not have` +
				"`SEND_MESSAGES` or `READ_MESSAGES` permissions.\n" +
				"Please ask an administrator to re-setup for logging `bulk_delete` logs if needed.";
			informationMessage.channel.send(errorMessage);
		}
	}else{ // When looging is deleted.
		updateData(updateObject);
	}
});

/*
	During any channel update, assure that bot still has the permissions to post said logs.
*/
client.on("channelUpdate", async (oldChannel, newChannel) => {
	if(["news", "text"].includes(newChannel.type)){ // Ensure we are checking Guild text channels.
		const botAsMember = newChannel.guild.me;
		const currentBotPermissions = newChannel.permissionsFor(botAsMember);

		// If permissions for bot for the updated channel has not changed, do not do anything.
		if(currentBotPermissions.equals(oldChannel.permissionsFor(botAsMember))) return;

		// Case that permission changes.
		const guildID = newChannel.guild.id;
		const guildSettingRow = readDataRow(guildID);
		const checkingChannelIDs = Object.values(guildSettingRow);
		const channelIDToCheck = newChannel.id;
		const updateObject = [];
		if(checkingChannelIDs.includes(channelIDToCheck)){ // Ensure channel checked is used for logging.
			// Only limit to logging channel ID of the channel that is being updated.
			const checkingChannelKeys = keySettingValues.filter(key =>
				guildSettingRow[key] === channelIDToCheck
			);
			if(currentBotPermissions.has(["VIEW_CHANNEL", "SEND_MESSAGES"])){
				if(currentBotPermissions.has("EMBED_LINKS")){ // Ensure can still send embeds.
					// Check that the channel updated for logging bulk delete can still attach files.
					if(checkingChannelKeys.includes("BD")){
						if(!currentBotPermissions.has("ATTACH_FILES")){
							updateObject.push([guildID, "BD", null]); // Object to send to DB on failure to log bulk_delete
							const messageString = "I am no longer able to log `bulk_delete`.\n" +
								"I have automatically disabled logging `bulk_delete` for now!";
							newChannel.send(messageString);
						}
					}
				}else{ // Can not send embed link to target channel but can send messages.
					const indexKeys = []; // This should contain at least one value.
					checkingChannelKeys.forEach(key => {
						updateObject.push([guildID, key, null]);
						indexKeys.push(keySettingValues.indexOf(key));
					});
					const sizeKeysArray = indexKeys.length;
					let messageString = "I am no longer able to log ";
					indexKeys.forEach((key, i) => { // Label all disabled logging types.
						if(i === sizeKeysArray - 2) messageString += `\`${loggingTypes[key]}\` and `;
						else if (i === sizeKeysArray - 1) messageString += `\`${loggingTypes[key]}\``;
						else messageString += `\`${loggingTypes[key]}\`, `;
					});
					messageString += ".\nI have automatically disabled logging them for now!";
					newChannel.send(messageString);
				}
			}else{ // Can not send/read target channel.
				checkingChannelKeys.forEach(key => {
					updateObject.push([guildID, key, null]);
				});
			}
		}
		if(updateObject.length > 0) updateData(updateObject);
	}
});

/*
    The bot that is invited to a guild must have more than 10 human members,
    or has the bot owner as the owner of the guild, otherwise bot leaves
    guild automatically.
*/
client.on("guildCreate", async (guild) => {
	const guildID = guild.id;
	consoleLogTime(`Guild ID ${guildID} attempted to add bot to server.`);
	if(guild.members.filter(member => !member.user.bot).size < 10){ // Do not add guild to database.
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
	if(newUser.id === client.user.id){ // Ensure change presence status as client username changes.
		if(oldUser.username !== newUser.username){
			client.user.setPresence({
				game: { name: `${prefix}help | @${newUser.username} help` }
			}).then(() => {
				consoleLogTime(`My username has been changed to ${client.user.username}`);
			});
		}
	}
});

client.on("debug", async (info) => { // Censor bot token in debug logs.
	if(info.includes(process.env.BOT_TOKEN)){
		const botToken = process.env.BOT_TOKEN;
		consoleLogTime(info.replace(botToken, "*****"));
	}else consoleLogTime(info);
});
client.on("disconnect", async () => consoleLogTime("==> I have disconnected!"));
client.on("error", async (error) => consoleLogTime(error.message));
client.on("warn", async (info) => consoleLogTime(info));

client.login(process.env.BOT_TOKEN).catch(error => consoleLogTime(`${error}`));
