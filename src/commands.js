const Database = require("./database.js");
const Guild_Setting = require("./common/guild_setting.js");

require("dotenv").config();

const author = String(process.env.AUTHOR_ID);
const prefix = process.env.PREFIX;

exports.processCommand = function(msg, client){
    const list_variables = msg.content.toLowerCase().slice(prefix.length).split(" ");
    console.log(`\n${String(list_variables)}`);

    /*
        In practical most commonly executed commands appears on top first.
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
                    const guild_id = msg.guild.id;
                    const valid_option = ["all", "user", "channel", "mod", "role"];

                    // In case there is no second argument "all" is used by default.
                    const default_option = !list_variables[1] ? valid_option[0] : null;
                    const usable_option = valid_option.includes(list_variables[1]);
                    const current_option = usable_option ? list_variables[1]: default_option;

                    switch(current_option){
                        // all
                        case valid_option[0]:
                            msg.channel.send(printStatusLog(12, 0, guild_id));
                            return;

                        // user
                        case valid_option[1]:
                            msg.channel.send(printStatusLog(6, 0, guild_id));
                            return;

                        // channel
                        case valid_option[2]:
                            msg.channel.send(printStatusLog(9, 6, guild_id));
                            return;

                        // mod
                        case valid_option[3]:
                            msg.channel.send(printStatusLog(11, 9, guild_id));
                            return;

                        // role
                        case valid_option[4]:
                            msg.channel.send(printStatusLog(12, 11, guild_id));
                            return;
                        default:
                            msg.channel.send(`Invalid second argument \`${list_variables[1]}\`.`)
                            return;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // Commands only the bot owner can use.
    if(msg.author.id === author){
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

function printStatusLog(maximum, minimum, guild_id){
    let message_string = "Current channels for logging of specific activity:";
    for(let i = minimum; i < maximum; i++){
        switch(i){
            case 0:
                message_string += "\n__**User Activities:**__\n";
                break;
            case 6:
                message_string += "\n__**Channel Activities:**__\n";
                break;
            case 9:
                message_string += "\n__**Moderator Activities:**__\n";
                break;
            case 11:
                message_string += "\n__**Roles Set:**__\n";
                break;
            default: 
                break;
        }
        let list_values = Guild_Setting.list_values[i];
        let result = Database.readGuild(guild_id, Guild_Setting.list_keys[i]);
        message_string += `${list_values}: ${result == null ? "Not Set!" : `<#${result}>`}\n`;
    }

    return message_string;
}
