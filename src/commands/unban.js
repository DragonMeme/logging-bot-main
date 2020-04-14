module.exports = {
	name: "unban",
	description: "Revokes a ban of a user in the guild.",
	examples: ["unban @This_User", "unban @ThatUser"],
	guildOnly: true,
	permissionLevel: 1,
	parameters: {
		user: {
			requirement: true,
			description: "The ID or a mention of the user."
		}
	},
	execute(message, otherArguments){
		const guild = message.guild;
		if(guild.me.hasPermission("BAN_MEMBERS")){
			switch(otherArguments.length){
				case 1:
				{
					const obtainedUserID = /\d+/.exec(otherArguments[0]);
					if(!obtainedUserID) return message.reply("Invalid user or ID.");
					return guild.fetchBans().then(bannedUsers => {
						const unbanUser = bannedUsers.get(obtainedUserID[0]);
						if(unbanUser) guild.unban(unbanUser);
						else message.reply("This user is not in the banned list!");
					});
				}

				default:
					return message.channel.send("You did not supply a user or ID.");
			}
		}
		return message.reply("Missing permission `BAN_MEMBERS`");
	}
};
