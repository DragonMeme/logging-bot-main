const database = require("./database.js");
const guildSetting = require("./common/guild_setting.js");
const pingCMD = require("./commands/user/ping.js");
const helpCMD = require("./commands/user/help.js");
const inviteCMD = require("./commands/user/invite.js");
const statuslogCMD = require("./commands/administrator/statuslog.js");

require("dotenv").config();

const author = process.env.AUTHOR_ID;
const prefix = process.env.PREFIX;

exports.processCommand = function(message, client){
    const listVariables = message.content.toLowerCase().slice(prefix.length).split(" ");
    const firstArgument = listVariables[0]; // Main argument

    /*
        In practical most commonly executed commands appears on top first.
        So checks in order of most likely commonly used commands.
    */
    if(firstArgument.length > 0){
        switch(firstArgument){
            case "ping":
            new pingCMD(message, listVariables).execute();
            break;

            case "help":
            new helpCMD(message, listVariables, prefix).execute();
            break;

            case "invite":
            new inviteCMD(message, listVariables, client).execute();
            break;

            /*
                MODERATOR ONLY COMMANDS
            */


            /*
                ADMINISTRATOR ONLY COMMANDS
            */
            case "statuslog":
            new statuslogCMD(message, listVariables).execute();
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
            const messageString = `Unknown command \`${firstArgument}\``;
            sendErrorAndDeleteUserAndClientMessage(message, messageString);
            break;
        }
    }
};

/*
    HELPER FUNCTIONS
*/

function sendErrorAndDeleteUserAndClientMessage(message, messageContent){
    message.channel.send(messageContent).then(
        sentMessage => {
            message.delete(2000);
            sentMessage.delete(2000);
        }
    );
}
