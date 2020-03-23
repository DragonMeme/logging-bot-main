const Moderator_Command = require("./moderator_command.js");

module.exports = class Administrator_Command extends Moderator_Command{
    constructor(message, argumentList){
        super(message, argumentList);
    }

    checkPermissionUser(){
        if(!super.checkPermissionUser()) return false; // Ensure that the error message does not get sent twice.
        const member = this.message.guild.members.find(member => member.id === this.message.author.id);
        let permissionLevel = 0;
        if(member.hasPermission(0x8)) permissionLevel++; // Administrator (not required)
        if(member.hasPermission(0x10)) permissionLevel++; // Manage Channels
        if(member.hasPermission(0x20)) permissionLevel++; // Manage Guild
        if(member.hasPermission(0x10000000)) permissionLevel++; // Manage Roles
        return permissionLevel > 2 ? true : this.sendPermissionError();
    }
}
