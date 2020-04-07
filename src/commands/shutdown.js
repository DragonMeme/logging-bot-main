module.exports = {
    name: "shutdown",
    description: "Shuts down the bot.",
    examples: ["shutdown"],
    permissionLevel: 3,
    parameters: {},
    execute(message, otherArguments){
        if(!["text", "dm"].includes(message.channel.type)) return;
        switch(otherArguments.length){
            case 0:
            return message.channel.send("Shutting down!").then(
                sentMessage => {
                    sentMessage.client.destroy();
                }
            );

            default:
            return message.channel.send("Too many arguments supplied.");
        }
    }
}