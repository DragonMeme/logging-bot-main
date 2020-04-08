const { isModerator, isAdministrator, isGuildOwner } = require("../common/permission_check.js");
const { readData, updateData } = require("../database.js");
const { discordLogTime, discordBasicUserDisplay } = require("../common/logger.js");

module.exports = {
	name: "kick",
	description: "Kicks a member from your server.",
	examples: ["kick 1234567890123456789", "kick @UserExample Spamming ads"],
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
			const memberToKick = message.guild.members.find(member => member.id === obtainedUserID[0]);
			switch(otherArguments.length){
				case 0: // No arguments supplied.
					return message.reply("You have not supplied a member of the guild for me to kick.");

				case 1: // Only the user is supplied.
					return attemptKickMember(message, memberToKick, null);

				default:{// A reason is supplied as well as the user.
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
	const channelFound = message.guild.channels.find(channel => channel.id === logsForUserKickedChannelID);
	/*
            These checks may not be needed as most can be handled by setlog/quicksetlog commands, 
            channelUpdate and channelDelete events.
            However these check are most useful in the event the bot is shut down and restarted
            and the requirements are not fetched by then.
        */
	if(!channelFound){ // Channel is deleted/missing.
		updateData(guildIDToCheck, "UK", null);
		const errorMessage = "The logging channel for `USER_KICKS` was not found.\n" +
                "The setting will be reset to none being set.\n" + 
                "Please ask an administrator to re-setup for logging `USER_KICKS` if needed.";
		return message.reply(errorMessage).then(() => {
			targetMember.kick(reason);
		});
	}else
	// Ensure the bot can send messages in the logging channel.
	if(channelFound.permissionsFor(message.guild.me).has(["SEND_MESSAGES", "VIEW_CHANNEL"])){
		const msgAuthor = message.member; // Member that requested the kick.
		const roleUserString = isGuildOwner(message.guild, msgAuthor.id) ? "Guild Owner" :
			isAdministrator(msgAuthor) ? "Administrator" : "Moderator"; 
		const messageString = "👢 **__Kick Command Initiated__** 👢\n" + 
			`**Kicked Member** (${discordBasicUserDisplay(targetMember)})\n` +
			`**Requested by ${roleUserString}** (${discordBasicUserDisplay(msgAuthor)})\n` +
			(!reason ? "" : `**With reason**:\n\`\`\`\n${reason}\n\`\`\``);
		return channelFound.send(discordLogTime(messageString)).then(() => {
			targetMember.kick(reason);
		});
	}
	updateData(guildIDToCheck, "UK", null);
	const errorMessage = `Cannot log \`USER_KICKS\` to <#${channelFound.id}> as I do not have` +
		"`SEND_MESSAGES` or `READ_MESSAGES` permission so I no longer will log `USER_KICKS`.\n" + 
		"Please ask an administrator to re-setup for logging `USER_KICKS` if needed.";
	return message.reply(errorMessage).then(() => {
		targetMember.kick(reason);
	});
		
	
}