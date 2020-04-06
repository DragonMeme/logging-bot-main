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
    if(member.hasPermission(0x2)) ++permissionLevel; // Kick Member
    if(member.hasPermission(0x4)) ++permissionLevel; // Ban Member
    if(member.hasPermission(0x2000)) ++permissionLevel; // Manage Messages
    if(member.hasPermission(0x8000000)) ++permissionLevel; // Manage Nicknames
    return permissionLevel > 2;
}

function isAdministrator(member){
    if(isModerator(member)){
        let permissionLevel = 0;
        if(member.hasPermission(0x8)) ++permissionLevel; // Administrator (not required)
        if(member.hasPermission(0x10)) ++permissionLevel; // Manage Channels
        if(member.hasPermission(0x20)) ++permissionLevel; // Manage Guild
        if(member.hasPermission(0x10000000)) ++permissionLevel; // Manage Roles
        return permissionLevel > 2;
    }else return false;
}