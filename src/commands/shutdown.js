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
            message.channel.send("Shutting down!").then(
                sentMessage => {
                    sentMessage.client.destroy();
                }
            );
            break;

            default:
            message.channel.send("Too many arguments supplied.");
            break;
        }
    }
}