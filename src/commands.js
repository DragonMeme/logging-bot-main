const database = require("./database.js");
const discord = require("discord.js");
const guildSetting = require("./common/guild_setting.js");

require("dotenv").config();

const author = process.env.AUTHOR_ID;
const prefix = process.env.PREFIX;
const partInviteLink = "https://discordapp.com/api/oauth2/authorize";

exports.processCommand = function(msg, client){
    const listVariables = msg.content.toLowerCase().slice(prefix.length).split(" ");
    //console.log(`\n${String(listVariables)}`);
    const firstArgument = listVariables[0];
    const clientID = client.id;

    /*
        In practical most commonly executed commands appears on top first.
        So checks in order of most likely commonly used commands.
    */
    if(firstArgument.length > 0){
        switch(firstArgument){
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
            case "invite":
                msg.react("🤔")
                const embed = new discord.RichEmbed()
                    .setColor("#00FFFF")
                    .setTitle("Click here to invite me!")
                    .setURL(`${partInviteLink}?client_id=${clientID}&permissions=268495958&scope=bot`);
                msg.author.send(embed);
                break;

            /*
                MODERATOR ONLY COMMANDS
            */


            /*
                ADMINISTRATOR ONLY COMMANDS
            */
            case "statuslog":
                if(hasAdminPermissions(msg)){
                    const guildID = msg.guild.id;
                    const validOption = guildSetting.listKeysSettingTypes;
                    // In case there is no second argument "all" is used by default.
                    const defaultOption = !listVariables[1] ? validOption[0] : null;
                    const usableOption = validOption.includes(listVariables[1]);
                    const currentOption = usableOption ? listVariables[1]: defaultOption;
                    if(!currentOption){
                        msg.channel.send(`Invalid second argument \`${listVariables[1]}\`.`)
                    }else{
                        const maxMin = guildSetting.selectCategory(currentOption);
                        msg.channel.send(printStatusLog(maxMin["max"], maxMin["min"], guildID));
                    }
                }
                break;

            /*
                BOT OWNER ONLY COMMANDS
                Any other users that attempt to use the bot owner only commands will be 
                redirected to the default case.
            */
            case "shutdown":
                if(msg.author.id == author){
                    // Send a message before shutting down.
                    msg.channel.send("Shutting down!").then(() => {
                        console.log("\nShutting down!");
                        client.destroy();
                    });
                    break;
                }  

            /*
                ANY OTHER COMMAND WILL TRIGGER THIS!
            */
            default:
                msg.channel.send(`Unknown command \`${listVariables[0]}\``).then(
                    sent => {
                        msg.delete(2000);
                        sent.delete(2000);
                    }
                )
                break;
        }
    }
};

/*
    HELPER FUNCTIONS
*/
function hasModPermissions(msg){
    const member = msg.guild.members.find(member => member.id === msg.author.id);
    let permissionLevel = 0;
    // A moderator should have at least 3 of the permissions.
    if(member.hasPermission(0x2)) permissionLevel++; // Kick Member
    if(member.hasPermission(0x4)) permissionLevel++; // Ban Member
    if(member.hasPermission(0x2000)) permissionLevel++; // Manage Messages
    if(member.hasPermission(0x8000000)) permissionLevel++; // Manage Nicknames
    if(permissionLevel > 2){
        return true;
    }else{
        return insufficientPermissionsPrint(msg);
    }
}

function hasAdminPermissions(msg){
    if(!hasModPermissions(msg)) return false;
    const member = msg.guild.members.find(member => member.id === msg.author.id);
    let permissionLevel = 0;
    // An admin should have at least 3 of the permissions along with all mod permissions.
    if(member.hasPermission(0x8)) permissionLevel++; // Administrator (not required)
    if(member.hasPermission(0x10)) permissionLevel++; // Manage Channels
    if(member.hasPermission(0x20)) permissionLevel++; // Manage Guild
    if(member.hasPermission(0x10000000)) permissionLevel++; // Manage Roles
    if(permissionLevel > 2){
        return true;
    }else{
        return insufficientPermissionsPrint(msg);
    }
}

function insufficientPermissionsPrint(msg){
    msg.channel.send("Insufficient permissions to run command.").then(
        sent => {
            msg.delete(2000);
            sent.delete(2000);
        }
    )
    return false;
}

function printStatusLog(maximum, minimum, guildID){
    const headers = guildSetting.listHeadersForStatusLog;
    let messageString = "Current channels for logging of specific activity:";
    for(let i = minimum; i < maximum; i++){
        if(Object.keys(headers).includes(String(i))) {
            messageString += `\n__**${headers[String(i)]}:**__\n`;
        }
        let listValues = guildSetting.listValuesSettingValues[i];
        let result = database.readGuild(guildID, guildSetting.listKeysSettingValues[i]);
        messageString += `${listValues}: ${result == null ? "Not Set!" : `<#${result}>`}\n`;
    }
    return messageString;
}
