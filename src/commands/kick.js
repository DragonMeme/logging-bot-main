const { isModerator, isAdministrator, isGuildOwner } = require("../common/permission_check.js");
const { readData, updateData } = require("../database.js");
const { discordBasicUserDisplay, getUTCTimeStamp } = require("../common/logger.js");
const { RichEmbed } = require("discord.js");

module.exports = {
	name: "kick",
	description: "Kicks a member from your server.",
	examples: ["kick 1234567890123456789", "kick @UserExample Spamming ads"],
	guildOnly: true,
	permissionLevel: 1,
	parameters: {
		member: {
			requirement: true,
			description: "The member to kick out of the server given the member is in the guild. " +
            "This argument must be the ID of the user or a user mention."
		},
		reason: {
			requirement: false,
			description: "The reason for the kick. The reason is not required to be put in double " +
            "quotation marks and can have more than 1 word."
		}
	},
	execute(message, otherArguments){
		if(message.guild.me.hasPermission("KICK_MEMBERS")){ // Ensure the bot has permission to kick.
			// Remove "<", "@", "!" and ">" if a mention is used to get the snowflake.
			const obtainedUserID = /\d+/.exec(otherArguments[0]);

			// Obtain member to kick.
			const memberToKick = message.guild.members.get(obtainedUserID[0]);
			switch(otherArguments.length){
				case 0: // No arguments supplied.
					return message.reply("You have not supplied a member of the guild for me to kick.");

				case 1: // Only the user is supplied.
					return attemptKickMember(message, memberToKick, null);

				default: // A reason is supplied as well as the user.
				{
					const reason = otherArguments.slice(1).join(" ");
					return attemptKickMember(message, memberToKick, reason);
				}
			}
		}else return message.reply("Missing permission `KICK MEMBERS`");
	}
};

function attemptKickMember(message, targetMember, reason){
	if(!targetMember) return message.reply("Sorry, I am unable to find that member in your guild!");
	if(targetMember.id === message.client.user.id) return message.reply("Sorry, I can not kick myself!");
	if(targetMember.kickable){ // Ensure that the bot can kick the member.
		if(isAdministrator(targetMember)){ // Bot will never kick administrators.
			return message.reply("Sorry, I do not kick administrators of the server.");
		}
		if(isAdministrator(message.member)){ // Administrators can kick moderators and lower.
			return message.channel.send(`<@${targetMember.id}> has been kicked!`).then(() => {
				kickMember(message, targetMember, reason);
			});
		}
		if(isModerator(targetMember)){ // Ensure member does not meet moderator criteria.
			return message.reply("Sorry, only administrators can allow me to kick moderators!");
		}
		return message.channel.send(`<@${targetMember.id}> has been kicked!`).then(() => {
			kickMember(message, targetMember, reason);
		});
	}
	// Other reasons bot can't kick user.
	return message.reply(`Sorry, I am unable to kick member (${discordBasicUserDisplay(targetMember)})!`);
}

function kickMember(message, targetMember, reason){
	const guildIDToCheck = message.guild.id;
	const logsForUserKickedChannelID = readData(guildIDToCheck, "UK");
	if(!logsForUserKickedChannelID){ // Logging for User Kicks not set.
		return targetMember.kick(reason);
	}
	const channelFound = message.guild.channels.get(logsForUserKickedChannelID);
	/*
		User Kicks should trigger the bot to post user kicks on the logging channel.
		Most of the error handling here are handled by channel updates.
		The error handling here is for just in case the bot is down when users change permissions.
	*/
	if(!channelFound){ // Channel is deleted/missing.
		updateData(guildIDToCheck, "UK", null);
		const errorMessage = "The logging channel for `USER_KICKS` was not found.\n" +
                "The setting will be reset to none being set.\n" +
                "Please ask an administrator to re-setup for logging `USER_KICKS` if needed.";
		return message.reply(errorMessage).then(() => {
			targetMember.kick(reason);
		});
	}
	const botPermissions = channelFound.permissionsFor(message.guild.me);
	// Ensure the bot can send messages in the logging channel.
	if(botPermissions.has(["SEND_MESSAGES", "VIEW_CHANNEL"])){
		if(botPermissions.has("EMBED_LINKS")){ // Ensure can post embeds.
			const authorID = message.author.id;
			const roleUserString = isGuildOwner(message.guild, authorID) ? "Guild Owner" :
				isAdministrator(authorID) ? "Administrator" : "Moderator";
			const reasonString = reason ? `**With reason**:\n${reason}` : "";
			const embed = new RichEmbed()
				.setTitle("👢 **__Kick Command Initiated__** 👢")
				.setDescription(`**Kicked Member** is <@${targetMember.id}>\n${reasonString}`)
				.addField("Requested By", `<@${authorID}>`, true)
				.addField("Requester Status", roleUserString)
				.setFooter(`Kicked Timestamp: ${getUTCTimeStamp(Date.now())}`);
			return channelFound.send(embed).then(() => targetMember.kick(reason));
		}
		// Unable to post embeds.
		const messageString = "I require permission `EMBED_LINKS` to post `user_kicked` logs." +
			"I have disabled logging this for now, you will have to re-enable this setting.";
		return channelFound.send(messageString).then(() => targetMember.kick(reason));
	}
	// Unable to send message in logging channel.
	updateData(guildIDToCheck, "UK", null);
	const errorMessage = `Cannot log \`user_kicked\` logs to <#${channelFound.id}> as I do not have` +
		"`SEND_MESSAGES` or `READ_MESSAGES` permissions.\n" +
		"Please ask an administrator to re-setup for logging `user_kicked` if needed.";
	return message.reply(errorMessage).then(() => targetMember.kick(reason));
}
