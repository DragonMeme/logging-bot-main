module.exports = class Command{
    constructor(message, argumentList){
        this.message = message;
        this.firstArgument = argumentList[0];
        this.otherArguments = argumentList.slice(1);
    }

    sendSentTooManyArgumentsError(){
        const messageString = `Too many arguments for command \`${this.firstArgument}\`!`;
        this.sendError(messageString);
    }

    sendError(errorMessage){
        this.message.channel.send(errorMessage).then(
            sent => {
                this.message.delete(2000);
                sent.delete(2000);
            }
        )
        return false;
    }
}