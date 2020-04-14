const { isModerator, isAdministrator } = require("../common/permission_check.js");
const { discordBasicUserDisplay } = require("../common/logger.js");

module.exports = {
	name: "ban",
	description: "Ban a user from the server.",
	examples: ["ban @This_User Being toxic.", "ban @That_User"],
	guildOnly: true,
	permissionLevel: 1,
	parameters: {
		user: {
			user: true,
			description: "The user to ban from the guild. The ID of the user does not have to be in the guild."
		},
		reason: {
			reason: false,
			description: "Supply a reason for the ban."
		}
	},
	execute(message, otherArguments){
		const guild = message.guild;
		if(guild.me.hasPermission("BAN_MEMBERS")){
			switch(otherArguments.length){
				case 0:
					return message.channel.send("You did not supply a user or ID.");

				case 1:
				{
					const obtainedUserID = /\d+/.exec(otherArguments[0]);
					if(!obtainedUserID) return message.reply("Invalid user or ID.");
					return banMember(message, obtainedUserID[0], null);
				}

				default:
				{
					const obtainedUserID = /\d+/.exec(otherArguments[0]);
					const reason = otherArguments.slice(2).join(" ");
					if(!obtainedUserID) return message.reply("Invalid user or ID.");
					return banMember(message, obtainedUserID[0], reason);
				}
			}
		}else return message.reply("Missing permission `BAN_MEMBERS`");
	}
};

function banMember(message, targetUserID, reason){
	const guild = message.guild;
	const targetMember = guild.members.get(targetUserID);
	if(targetMember){ // If target person to ban is in the guild.
		if(targetMember.id === message.client.user.id) return message.reply("Sorry, I can not ban myself!");
		if(targetMember.bannable){ // Ensure that the bot can kick the member.
			if(isAdministrator(targetMember)){ // Bot will never kick administrators.
				return message.reply("Sorry, I do not ban administrators of this server.");
			}
			if(isAdministrator(message.member)){ // Administrators can kick moderators and lower.
				return message.channel.send(`<@${targetMember.id}> has been banned!`).then(() => {
					guild.ban(targetUserID, {days: 7, reason: reason});
				});
			}
			if(isModerator(targetMember)){ // Ensure member does not meet moderator criteria.
				return message.reply("Sorry, only administrators can allow me to ban moderators!");
			}
			return message.channel.send(`<@${targetMember.id}> has been banned!`).then(() => {
				guild.ban(targetUserID, {days: 7, reason: reason});
			});
		}
		// Other reasons bot can't ban user.
		return message.reply(`Sorry, I am unable to ban member (${discordBasicUserDisplay(targetMember)})!`);
	}
	return message.client.fetchUser(targetUserID).then(user => { // Case user is not in guild.
		message.channel.send(`<@${user.id}> has been banned!`);
		guild.ban(user, {days: 7, reason: null});
	}).catch(() => {
		message.reply("Sorry, I am unable to find that member.");
	});
}
