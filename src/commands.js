const database = require("./database.js");
const discord = require("discord.js");
const guildSetting = require("./common/guild_setting.js");
const helpInfo = require("./common/help.js");

require("dotenv").config();

const author = process.env.AUTHOR_ID;
const prefix = process.env.PREFIX;
const partInviteLink = "https://discordapp.com/api/oauth2/authorize";

exports.processCommand = function(message, client){
    const listVariables = message.content.toLowerCase().slice(prefix.length).split(" ");
    const firstArgument = listVariables[0]; // Main argument
    const otherArguments = listVariables.slice(1); // Other argument(s).
    const clientID = client.id;

    /*
        In practical most commonly executed commands appears on top first.
        So checks in order of most likely commonly used commands.
    */
    if(firstArgument.length > 0){
        switch(firstArgument){
            case "ping":
            switch(otherArguments.length){
                case 0: // No other arguments needed.
                const timeSent = message.createdTimestamp;
                message.channel.send("Pong!").then(
                    sentMessage => {
                        const timeResponse = sentMessage.createdTimestamp;
                        const ping = timeResponse - timeSent;
                        sentMessage.edit(`Pong! \`${String(ping)}ms\``);
                    }
                );
                break;

                default: // Too many arguments.
                message.channel.send("Too many arguments for command `ping`!");
                break;
            }
            break;

            case "help":
            const listArguments = helpInfo.helpArguments;
            switch(otherArguments.length){
                case 0: // No second argument.
                message.react("🤔");
                const embed = new discord.RichEmbed()
                .setColor("#00FFFF")
                .setTitle("Hyo Bot Help! (Click here to join the support server)")
                .setDescription(helpInfo.getMainDescription(prefix))
                .setURL(process.env.MAIN_SERVER_LINK);
                listArguments.forEach(
                    argument => {
                        let usage = helpInfo.getParameter(argument, "Usage");
                        let shortDescription = helpInfo.getParameter(argument, "Short Description");
                        embed.addField(`${prefix}${usage}`, shortDescription);
                    }
                );
                message.author.send(embed);
                break;

                case 1: // Has a second argument.
                const secondArgument = otherArguments[0];
                if(listArguments.includes(secondArgument)){
                    message.react("🤔");
                    const usage = helpInfo.getParameter(secondArgument, "Usage");
                    const showExamples = helpInfo.getParameter(secondArgument, "Examples");
                    const splitUsage = usage.split(" ").slice(1); // Since first argument is main
                    const embed = new discord.RichEmbed()
                    .setColor("#00FFFF").setTitle(`COMMAND: ${secondArgument}`)
                    .setDescription(helpInfo.getParameter(secondArgument, "Long Description"))
                    .addField("Permission Level", helpInfo.getParameter(secondArgument, "Permission"))
                    .addField("Usage", `\`${prefix}${usage}\``);
                    let showExampleString = "";
                    splitUsage.forEach(
                        argumentPart => { // Each variable argument has its own fields.
                            let descriptionArgument = helpInfo.getParameter(secondArgument, argumentPart);
                            let overallDescription = `${argumentPart.startsWith("[") ? "OPTIONAL" : "REQUIRED"}: ${descriptionArgument}`;
                            embed.addField(argumentPart, overallDescription);
                        }
                    );
                    showExamples.forEach(
                        example => {
                            showExampleString += `\`${prefix}${example}\`\n`;
                        }
                    );
                    if(showExamples.length > 0){
                        embed.addField(`Example${showExamples.length === 1 ? "":"s"}`, showExampleString);
                    }
                    message.author.send(embed);
                }else{ // Unsupported commands for user.
                    message.channel.send(`Sorry, I do not process command \`${secondArgument}\``).then(
                        sentMessage => {
                            message.delete(2000);
                            sentMessage.delete(2000);
                        }
                    );
                }
                break;

                default: // Too many arguments.
                message.channel.send("Too many arguments for command `help`!");
                break;
            }
            break;

            case "invite":
                message.react("🤔");
                const embed = new discord.RichEmbed()
                    .setColor("#00FFFF")
                    .setTitle("Click here to invite me!")
                    .setURL(`${partInviteLink}?client_id=${clientID}&permissions=268495958&scope=bot`);
                message.author.send(embed);
                break;

            /*
                MODERATOR ONLY COMMANDS
            */


            /*
                ADMINISTRATOR ONLY COMMANDS
            */
            case "statuslog":
                if(hasAdminPermissions(message)){
                    const guildID = message.guild.id;
                    const validOption = guildSetting.listKeysSettingTypes;
                    // In case there is no second argument "all" is used by default.
                    const defaultOption = !listVariables[1] ? validOption[0] : null;
                    const usableOption = validOption.includes(listVariables[1]);
                    const currentOption = usableOption ? listVariables[1]: defaultOption;
                    if(!currentOption){
                        message.channel.send(`Invalid second argument \`${listVariables[1]}\`.`)
                    }else{
                        const maxMin = guildSetting.selectCategory(currentOption);
                        message.channel.send(printStatusLog(maxMin["max"], maxMin["min"], guildID));
                    }
                }
                break;

            /*
                BOT OWNER ONLY COMMANDS
                Any other users that attempt to use the bot owner only commands will be 
                redirected to the default case.
            */
            case "shutdown":
                if(message.author.id == author){
                    message.channel.send("Shutting down!").then(() => {
                        console.log("\nShutting down!");
                        client.destroy();
                    });
                    break;
                }  

            /*
                ANY OTHER COMMAND WILL TRIGGER THIS!
            */
            default:
                message.channel.send(`Unknown command \`${firstArgument}\``).then(
                    sentMessage => {
                        message.delete(2000);
                        sentMessage.delete(2000);
                    }
                )
                break;
        }
    }
};

/*
    HELPER FUNCTIONS
*/
function hasModPermissions(message){
    const member = message.guild.members.find(member => member.id === message.author.id);
    let permissionLevel = 0;
    if(member.hasPermission(0x2)) permissionLevel++; // Kick Member
    if(member.hasPermission(0x4)) permissionLevel++; // Ban Member
    if(member.hasPermission(0x2000)) permissionLevel++; // Manage Messages
    if(member.hasPermission(0x8000000)) permissionLevel++; // Manage Nicknames
    if(permissionLevel > 2){
        return true;
    }else{
        return insufficientPermissionsPrint(message);
    }
}

function hasAdminPermissions(message){
    if(!hasModPermissions(message)){
        return false;
    }
    const member = message.guild.members.find(member => member.id === message.author.id);
    let permissionLevel = 0;
    if(member.hasPermission(0x8)) permissionLevel++; // Administrator (not required)
    if(member.hasPermission(0x10)) permissionLevel++; // Manage Channels
    if(member.hasPermission(0x20)) permissionLevel++; // Manage Guild
    if(member.hasPermission(0x10000000)) permissionLevel++; // Manage Roles
    if(permissionLevel > 2){
        return true;
    }else{
        return insufficientPermissionsPrint(message);
    }
}

function insufficientPermissionsPrint(message){
    message.channel.send("Insufficient permissions to run command.").then(
        sent => {
            message.delete(2000);
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
