const { isAdministrator, isModerator, isGuildOwner } = require("../common/permission_check.js");
const { getUTCTimeStamp } = require("../common/logger.js");
const { readData, updateData } = require("../database.js");
const { RichEmbed } = require("discord.js");

module.exports = {
	name: "mute",
	description: "Assigns a muted role to a user for a specific amount of time. Ideally the muted role ",
	examples: ["mute @User 1d Trolling in channel.", "mute @user 30m Spamming ads."],
	guildOnly: true,
	permissionLevel: 1,
	parameters: {
		member: {
			requirement: true,
			description: "The member to mute. This can be the ID of the member or a mention."
		},
		time: {
			requirement: true,
			description: "The duration of the mute. The time can be supplied in just numbers or with a letter modifier.\nThe modifier can be either m (minute), h(hour),d(day) or i(until unmuted). The modifier is by default in minutes."
		},
		reason: {
			requirement: false,
			description: "The reason for the mute. This is optional for justifying why user is chosen to be muted."
		}
	},
	execute(message, otherArguments){
		if(!message.guild.me.hasPermission("MANAGE_ROLES")){
			return message.reply("Please grant me permission `MANAGE_ROLES` for this command!");
		}
		switch(otherArguments.length){
			case 0: // No arguments supplied
				return message.reply("You have not supplied a member of the guild for me to kick.");

			case 1: // One argument supplied, valid user will return a prompt asking for duration.
			{
				// Remove "<", "@", "!" and ">" if a mention is used to get the snowflake.
				const targetMemberID = /\d+/.exec(otherArguments[0]);

				// Obtain member to kick given valid argument.
				if(!targetMemberID) return message.reply("Sorry, invalid argument for member!");
				const targetMember = message.guild.members.get(targetMemberID[0]);
				if(targetMember){
					if(isAdministrator(targetMember)){ // Administrators can not be muted.
						return message.reply("Sorry, I do not mute administrators of this server");
					}
					if(isAdministrator(message.member)){
						return message.reply("You have not specified a duration.");
					}
					if(isModerator(targetMember)){ // Administrators may mute a moderator.
						return message.reply("Sorry, only administrators can mute this user!");
					}
					return message.reply("You have not specified a duration.");
				}
				return message.reply("Sorry I am unable to find that member");
			}

			case 2:
			{
				// Remove "<", "@", "!" and ">" if a mention is used to get the snowflake.
				const targetMemberID = /\d+/.exec(otherArguments[0]);

				// Obtain member to kick given valid argument.
				if(targetMemberID.length === 0) return message.reply("Sorry, invalid argument for member!");
				const targetMember = message.guild.members.get(targetMemberID[0]);

				const timerArgument = /^\d+[m|h|d]$/.exec(otherArguments[1]);
				if(targetMember){ // Target member is valid.
					if(isAdministrator(targetMember)){ // Administrators can not be muted.
						return message.reply("Sorry, I do not mute administrators of this server");
					}
					if(isAdministrator(message.member)){
						if(otherArguments[1] === "i") return applyMuteRoleTimer(message, targetMember, 0, null);
						const timer = convertStringToMs(timerArgument[0]);
						if(timer === 0) return message.reply("This time is out of range, Range is 1 minute to 3 days.");
						return applyMuteRoleTimer(message, targetMember, timer, null);
					}
					if(isModerator(targetMember)){ // Administrators may mute a moderator.
						return message.reply("Sorry, only administrators can mute this user!");
					}
					if(otherArguments[1] === "i") return applyMuteRoleTimer(message, targetMember, 0, null);
					const timer = convertStringToMs(timerArgument[0]);
					if(timer === 0) return message.reply("This time is out of range, Range is 1 minute to 3 days.");
					return applyMuteRoleTimer(message, targetMember, timer, null);
				}
				return message.reply("Sorry I am unable to find that member");
			}

			default:
			{
				// Remove "<", "@", "!" and ">" if a mention is used to get the snowflake.
				const targetMemberID = /\d+/.exec(otherArguments[0]);

				// Obtain member to kick given valid argument.
				if(targetMemberID.length === 0) return message.reply("Sorry, invalid argument for member!");
				const targetMember = message.guild.members.get(targetMemberID[0]);

				const timerArgument = /^\d+[m|h|d]$/.exec(otherArguments[1]);
				const reason = otherArguments.slice(2).join(" ");
				if(targetMember){
					if(isAdministrator(targetMember)){ // Administrators can not be muted.
						return message.reply("Sorry, I do not mute administrators of this server");
					}
					if(isAdministrator(message.member)){
						if(otherArguments[1] === "i") return applyMuteRoleTimer(message, targetMember, 0, reason);
						const timer = convertStringToMs(timerArgument[0]);
						if(timer === 0) return message.reply("This time is out of range, Range is 1 minute to 3 days.");
						return applyMuteRoleTimer(message, targetMember, timer, reason);
					}
					if(isModerator(targetMember)){ // Administrators may mute a moderator.
						return message.reply("Sorry, only administrators can mute this user!");
					}
					if(otherArguments[1] === "i") return applyMuteRoleTimer(message, targetMember, 0, reason);
					const timer = convertStringToMs(timerArgument[0]);
					if(timer === 0) return message.reply("This time is out of range, Range is 1 minute to 3 days.");
					return applyMuteRoleTimer(message, targetMember, timer, reason);
				}
				return message.reply("Sorry I am unable to find that member");
			}
		}
	}
};

function applyMuteRoleTimer(message, member, timeInMs, reason){
	const guild = member.guild;
	const targetRoleID = readData(guild.id, "MR");
	if(targetRoleID){
		const roleObject = guild.roles.get(targetRoleID);
		if(!roleObject){ // Role deleted.
			message.reply("You have not setup a muted role, but one has been created.");
			guild.createRole({
				name: "muted",
				hoist: false,
				mentionable: true,
				permissions: 0
			}, "Made a role to help deny joining voice channels and sending of messages.").then(role => {
				updateData([[guild.id, "MR", role.id]]);
			});

		}else{ // Role exists and assigned.
			if(timeInMs <= 259200000 && timeInMs >= 60000){ // In range of 1 minute to 3 days.
				const days = Math.floor(timeInMs / 86400000);
				const hours = Math.floor(timeInMs / 3600000) % 24;
				const minutes = Math.floor(timeInMs / 60000) % 60;
				const timeString = `${days > 0 ? `${days} day${days === 1 ? "" : "s"}${minutes > 0 ? hours > 0 ? ", " : " and " : " and "}` : ""}${hours > 0 ? `${hours} hour${hours === 1 ? "" : "s"}${minutes > 0 ? ` and ${minutes} minute${minutes === 1 ? "" : "s"}` : ""}` : ""}`;
				message.channel.send(`Muted <@${member.id}> for ${timeString}${reason ? ` with reason ${reason}` : "."}`).then(() => {
					member.addRole(targetRoleID, reason);
					sendLogs(message, timeString, member.id, reason);
				});
				setTimeout(() => { // Set a timer.
					member.removeRole(targetRoleID, "Mute timer was up!").then(() => {
						message.channel.send(`<@${member.id}> is now unmuted!`);
					});
					sendUnmutedLogs(message, member.id);
				}, timeInMs);
			}else{
				if(timeInMs === 0){ // Input for timer is "i".
					message.channel.send(`Muted <@${member.id}> ${reason ? ` with reason ${reason}` : "."}`).then(() => {
						member.addRole(targetRoleID, reason);
						sendLogs(message, null, member.id, reason);
					});
				}else{
					message.reply("This time is out of range, Range is 1 minute to 3 days.");
				}
			}
		}
	}else{ // No role ID exists.
		message.reply("You have not setup a muted role, but one has been created.");
		guild.createRole({
			name: "muted",
			hoist: true,
			mentionable: true,
			permissions: 0
		}, "Made a role to help deny joining voice channels and sending of messages.").then(role => {
			updateData([[guild.id, "MR", role.id]]);
		});
	}
}

// Send muted person log.
function sendLogs(message, timerString, targetMemberID, reason){
	const guild = message.guild;
	const loggingChannelID = readData(guild.id, "UM");
	if(loggingChannelID){ // Channel ID exists.
		const loggingChannel = guild.channels.get(loggingChannelID);
		if(loggingChannel){ // Logging chanel exists.
			const permissions = loggingChannel.permissionsFor(guild.me);
			if(permissions.has(["VIEW_CHANNEL", "SEND_MESSAGES"])){
				if(permissions.has("EMBED_LINKS")){ // Can send embed links.
					const requester = message.member;
					const roleUserString = isGuildOwner(guild, requester.id) ? "Guild Owner" : isAdministrator(requester) ? "Administrator" : "Moderator";
					const embed = new RichEmbed()
						.setTitle("🔇 **__Mute Command Initiated__** 🔇")
						.setDescription(`**Muted User** is <@${targetMemberID}>\n${reason ? reason : ""}`)
						.addField("Requested By", `<@${requester.id}>`)
						.addField("Requester Status", roleUserString)
						.addField("Duration of Mute", timerString ? timerString : "Until unmuted!")
						.setFooter(`Mute initiated TimeStamp: ${getUTCTimeStamp(Date.now())}`);
					loggingChannel.send(embed);
				}else{ // Unable to send embed links.
					updateData([[guild.id, "UM", null]]);
					const errorMessage = `Cannot log \`user_muted\` logs to <#${loggingChannelID}> as I do not have \`EMBED_LINKS\` permissions.\nPlease ask an administrator to re-setup for logging \`user_muted\` if needed.`;
					message.reply(errorMessage);
				}
			}else updateData([[guild.id, "UM", null]]);
		}
	}
}

// Send un-muted person log.
function sendUnmutedLogs(message, targetMemberID){
	const guild = message.guild;
	const loggingChannelID = readData(guild.id, "UM");
	if(loggingChannelID){ // Channel ID exists.
		const loggingChannel = guild.channels.get(loggingChannelID);
		if(loggingChannel){ // Logging chanel exists.
			const permissions = loggingChannel.permissionsFor(guild.me);
			if(permissions.has(["VIEW_CHANNEL", "SEND_MESSAGES"])){
				if(permissions.has("EMBED_LINKS")){ // Can send embed links.
					const embed = new RichEmbed()
						.setTitle("🔈 **__Unmuted Command Initiated__** 🔈")
						.setDescription(`**Muted User** was <@${targetMemberID}>`)
						.setFooter(`Unmuted TimeStamp: ${getUTCTimeStamp(Date.now())}`);
					loggingChannel.send(embed);
				}else{ // Unable to send embed links.
					updateData([[guild.id, "UM", null]]);
					const errorMessage = `Cannot log \`user_muted\` logs to <#${loggingChannelID}> as I do not have \`EMBED_LINKS\` permissions.\nPlease ask an administrator to re-setup for logging \`user_muted\` if needed.`;
					message.reply(errorMessage);
				}
			}else updateData([[guild.id, "UM", null]]);
		}
	}
}

/*
	Convert range for end of string:
	m: minute (number * 60000)
	h: hour (number * 3600000)
	d: day (number * 86400000)
*/
function convertStringToMs(string){
	const timer = Number.parseInt(string);
	if(isNaN(timer)) return 0;
	if(string.endsWith("d")) return timer * 86400000;
	if(string.endsWith("h")) return timer * 3600000;
	if(string.endsWith("m")) return timer * 60000;
	return timer * 60000;
}
