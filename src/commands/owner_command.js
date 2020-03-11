const Command = require("./command.js");

require("dotenv").config();

module.exports = class Owner_Command extends Command{
    constructor(message, argumentList){
        super(message, argumentList);
    }

    checkPermissionUser(){
        return this.message.author.id == process.env.AUTHOR_ID ? true : this.sendPermissionError(); 
    }

    sendPermissionError(){
        const messageString = `Unknown command \`${this.argumentList[0]}\``;
        this.sendError(messageString);
    }
}