module.exports = {
    name: "ping",
    description: "Checks latency of the bot.",
    examples: ["ping"],
    permissionLevel: 0,
    parameters: {},
    execute(message, otherArguments){
        switch(otherArguments.length){
            case 0: // No other arguments needed.
            message.channel.send("Pong!").then(
                sentMessage => {
                    const timeSent = message.createdTimestamp;
                    const timeResponse = sentMessage.createdTimestamp;
                    const ping = timeResponse - timeSent;
                    sentMessage.edit(`Pong! \`${String(ping)}ms\``);
                }
            );
            break;

            default:
            message.channel.send("Too many arguments supplied.");
            break;
        }
    }
}