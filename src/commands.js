const Database = require("./database");

exports.processCommand = function(msg, prefix, client){
    let list_variables = msg.content.toLowerCase().slice(prefix.length).split(" ");

    /*
        Practically most commonly executed commands appears on top first.
        So checks in order of most likely commonly used commands.
    */

    //Any user can use these commands.
    switch(list_variables[0]){
        case "ping":
            // Obtain time the user sent the message.
            var timeSent = msg.createdTimestamp;
            msg.channel.send("Pong!").then(
                // Attempt to edit the message by adding the time.
                sent => {

                    // Obtain time stamp between user message and bot message.
                    var timePing = sent.createdTimestamp;
                    var ping = timePing - timeSent;

                    // Add ping message.
                    sent.edit(`Pong! \`${String(ping)}ms\``);
                }
            );
            break;
    }

    // Only a moderator may use these commands.
    if(hasModPermissions(msg)){
        switch(list_variables[0]){
            default:
                break;
        }

        // Only an administrator may use these commands.
        if(hasAdminPermissions(msg)){
            switch(list_variables[0]){
                case "statuslog":
                    let message_string = "Current channels for logging of specific activity:\n";
                    message_string += "__**User Activities:**__\n";
                    message_string += `User Joins: ${Database.readGuild(msg.guild.id, "UJ")}\n`;
                    message_string += `User Leaves: ${Database.readGuild(msg.guild.id, "UL")}\n`;
                    message_string += `User Message Deletes: ${Database.readGuild(msg.guild.id, "UMD")}\n`;
                    message_string += `User Message Edits: ${Database.readGuild(msg.guild.id, "UME")}\n`;
                    message_string += `User Nickname Changes: ${Database.readGuild(msg.guild.id, "UNC")}\n`;
                    message_string += `User Role Assigns: ${Database.readGuild(msg.guild.id, "URA")}\n\n`;

                    message_string += "__**Channel Activities:**__\n";
                    message_string += `Bulk Delete: ${Database.readGuild(msg.guild.id, "BD")}\n`;
                    message_string += `Voice Chat Joins: ${Database.readGuild(msg.guild.id, "VJ")}\n`;
                    message_string += `Voice Chat Leaves: ${Database.readGuild(msg.guild.id, "VL")}\n\n`;

                    message_string += "__**Moderator Activities:**__\n";
                    message_string += `User Kicked: ${Database.readGuild(msg.guild.id, "UK")}\n`;
                    message_string += `User Muted: ${Database.readGuild(msg.guild.id, "UM")}\n\n`;

                    message_string += "__**Roles Set:**__\n";
                    message_string += `Muted Role: ${Database.readGuild(msg.guild.id, "MR")}\n`;

                    msg.channel.send(message_string)
                    break;
                default:
                    break;
            }
        }
    }

    // Commands only the bot owner can use.
    if(msg.author.id === process.env.AUTHOR_ID){
        // These commands only apply to bot author
        switch(list_variables[0]){
            case "shutdown":
                // Send a message before shutting down.
                msg.channel.send("Shutting down!").then(() => {
                    console.log("\nShutting down!");
                    client.destroy();
                }).catch();
                break;
            default:
                break;
        }
    }
};

/*
    HELPER FUNCTIONS
*/
function hasModPermissions(msg){
    let member = msg.guild.members.find(member => member.id === msg.author.id);
    let permissionLevel = 0;

    // First check for moderator permissions.
    // A moderator should have at least 3 of the permissions.
    if(member.hasPermission(0x2)) permissionLevel++; // Kick Member
    if(member.hasPermission(0x4)) permissionLevel++; // Ban Member
    if(member.hasPermission(0x2000)) permissionLevel++; // Manage Messages
    if(member.hasPermission(0x8000000)) permissionLevel++; // Manage Nicknames

    return permissionLevel > 2;
}

function hasAdminPermissions(msg){
    let member = msg.guild.members.find(member => member.id === msg.author.id);
    let permissionLevel = 0;

    // First check for admin permissions.
    // An admin should have at least 3 of the permissions.
    if(member.hasPermission(0x8)) permissionLevel++; // Administrator (not required)
    if(member.hasPermission(0x10)) permissionLevel++; // Manage Channels
    if(member.hasPermission(0x20)) permissionLevel++; // Manage Guild
    if(member.hasPermission(0x10000000)) permissionLevel++; // Manage Roles

    return permissionLevel > 2;
}
