module.exports = {
	name: "ping",
	description: "Checks latency of the bot.",
	examples: ["ping"],
	permissionLevel: 0,
	parameters: {},
	execute(message, otherArguments){
		if(!["text", "dm"].includes(message.channel.type)) return;
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