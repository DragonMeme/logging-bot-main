const botAuthor = process.env.AUTHOR_ID;

module.exports = {
    isModerator : function(member){ // Needs to be member object.
        return isModerator(member);
    },
    
    isAdministrator : function(member){ // Needs to be member object.
        return isAdministrator(member);
    },

    isBotOwner : function(member){ // Can be member or user.
        return member.id === botAuthor;
    },

    isGuildOwner : function(guild, userID){
        if(userID === "owner") return guild.ownerID === botAuthor;
        else return guild.ownerID === userID;
    }
}

function isModerator(member){
    let permissionLevel = 0;
    if(member.hasPermission("KICK_MEMBERS")) ++permissionLevel;
    if(member.hasPermission("BAN_MEMBERS")) ++permissionLevel;
    if(member.hasPermission("MANAGE_MESSAGES")) ++permissionLevel;
    if(member.hasPermission("MANAGE_NICKNAMES")) ++permissionLevel;
    return permissionLevel > 2;
}

function isAdministrator(member){
    if(isModerator(member)){
        let permissionLevel = 0;
        if(member.hasPermission("ADMINISTRATOR")) ++permissionLevel;
        if(member.hasPermission("MANAGE_CHANNELS")) ++permissionLevel;
        if(member.hasPermission("MANAGE_GUILD")) ++permissionLevel;
        if(member.hasPermission("MANAGE_ROLES")) ++permissionLevel;
        return permissionLevel > 2;
    }else return false;
}