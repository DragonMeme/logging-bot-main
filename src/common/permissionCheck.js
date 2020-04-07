const botAuthor = process.env.AUTHOR_ID;

module.exports = {
    isModerator : function(message){
        return isModerator(message);
    },
    
    isAdministrator : function(message){
        return isAdministrator(message);
    },

    isBotOwner : function(message){
        return message.author.id === botAuthor;
    },

    isGuildOwner : function(guild, userID){
        if(userID === "owner") return guild.ownerID === botAuthor;
        else return guild.ownerID === userID;
    }
}

function isModerator(message){
    const member = message.guild.members.find(member => member.id === message.author.id);
    let permissionLevel = 0;
    if(member.hasPermission(0x2)) ++permissionLevel; // Kick Member
    if(member.hasPermission(0x4)) ++permissionLevel; // Ban Member
    if(member.hasPermission(0x2000)) ++permissionLevel; // Manage Messages
    if(member.hasPermission(0x8000000)) ++permissionLevel; // Manage Nicknames
    return permissionLevel > 2;
}

function isAdministrator(message){
    if(isModerator(message)){
        const member = message.guild.members.find(member => member.id === message.author.id);
        let permissionLevel = 0;
        if(member.hasPermission(0x8)) ++permissionLevel; // Administrator (not required)
        if(member.hasPermission(0x10)) ++permissionLevel; // Manage Channels
        if(member.hasPermission(0x20)) ++permissionLevel; // Manage Guild
        if(member.hasPermission(0x10000000)) ++permissionLevel; // Manage Roles
        return permissionLevel > 2;
    }else return false;
}