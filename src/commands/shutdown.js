module.exports = {
	name: "shutdown",
	description: "Shuts down the bot.",
	examples: ["shutdown"],
	guildOnly: false,
	permissionLevel: 3,
	parameters: {},
	execute(message, otherArguments){
		switch(otherArguments.length){
			case 0:
				message.channel.send("Shutting down!").then(
					sentMessage => {
						sentMessage.client.destroy();
					}
				);
				break;

			default:
				message.channel.send("Too many arguments supplied.");
		}
	}
};
