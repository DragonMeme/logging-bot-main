module.exports = {
	name: "ping",
	description: "Checks latency of the bot.",
	examples: ["ping"],
	guildOnly: false,
	permissionLevel: 0,
	parameters: {},
	execute(message, otherArguments){
		switch(otherArguments.length){
			case 0: // No other arguments needed.
				message.channel.send("Pong!").then(
					sentMessage => {
						const ping = sentMessage.createdTimestamp - message.createdTimestamp;
						sentMessage.edit(`Pong! \`${String(ping)}ms\``);
					}
				);
				break;

			default:
				message.channel.send("Too many arguments supplied.");
		}
	}
};
