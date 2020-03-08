const Moderator_Command = require("./moderator_command.js");

module.exports = class Administrator_Command extends Moderator_Command{
    constructor(message, argumentList){
        super(message, argumentList);
    }

    execute(){
        if(!this.checkPermissionUser()){
            return;
        }
    }

    checkPermissionUser(){
        if(!super.sendPermissionError()){
            return false; // Ensure that the error message does not get sent twice.
        }
        const member = this.message.guild.members.find(member => member.id === this.message.author.id);
        let permissionLevel = 0;
        if(member.hasPermission(0x2)) permissionLevel++; // Kick Member
        if(member.hasPermission(0x4)) permissionLevel++; // Ban Member
        if(member.hasPermission(0x2000)) permissionLevel++; // Manage Messages
        if(member.hasPermission(0x8000000)) permissionLevel++; // Manage Nicknames
        if(permissionLevel > 2){
            return true;
        }else{
            return this.sendPermissionError();
        }
    }
}