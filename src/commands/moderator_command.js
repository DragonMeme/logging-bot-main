const Command = require("./command.js");

module.exports = class Moderator_Command extends Command{
    constructor(message, argumentList){
        super(message, argumentList);
    }

    checkPermissionUser(){
        const member = this.message.guild.members.find(member => member.id === this.message.author.id);
        let permissionLevel = 0;
        if(member.hasPermission(0x2)) permissionLevel++; // Kick Member
        if(member.hasPermission(0x4)) permissionLevel++; // Ban Member
        if(member.hasPermission(0x2000)) permissionLevel++; // Manage Messages
        if(member.hasPermission(0x8000000)) permissionLevel++; // Manage Nicknames
        return permissionLevel > 2 ? true : this.sendPermissionError();
    }

    sendPermissionError(){
        const message = `<@${this.message.author.id}> You have insufficient permissions to run command \`${this.firstArgument}\``;
        this.sendError(message);
    }
}