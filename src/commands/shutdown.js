module.exports = {
    name: "shutdown",
    description: "Shuts down the bot.",
    permissionLevel: 3,
    execute(message, otherArguments){
        switch(otherArguments.length){
            case 0:
            message.channel.send("Shutting down!").then(
                sentMessage => {
                    console.log("\nShutting down!");
                    sentMessage.client.destroy();
            });
            break;

            default:
            break;
        }
    }
}