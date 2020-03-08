const Command = require("../command.js");

module.exports = class ping extends Command{
    constructor(message, argumentList){
        super(message, argumentList);
    }

    execute(){
        switch(this.otherArguments.length){
            case 0: // No other arguments needed.
            const timeSent = this.message.createdTimestamp;
            this.message.channel.send("Pong!").then(
                sentMessage => {
                    const timeResponse = sentMessage.createdTimestamp;
                    const ping = timeResponse - timeSent;
                    sentMessage.edit(`Pong! \`${String(ping)}ms\``);
                }
            );
            break;

            default: // Too many arguments.
            const messageString = "Too many arguments for command `ping`!"
            this.sendError(messageString);
            break;
        }
    }
}
