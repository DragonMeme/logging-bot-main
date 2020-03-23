const discord = require("discord.js");

module.exports = {
    name: "invite",
    description: "DMs you a hyperlink to invite the bot.",
    permissionLevel: 0,
    execute(message, otherArguments){
        switch(otherArguments.length){
            case 0: // No other arguments needed.
            message.react("🤔").then(
                reaction => {
                    clientID = reaction.users.firstKey();
                    const embed = new discord.RichEmbed()
                        .setColor("#00FFFF")
                        .setTitle("Click here to invite me!")
                        .setURL(`https://discordapp.com/api/oauth2/authorize?client_id=${clientID}&permissions=268495958&scope=bot`);
                    message.author.send(embed);
                        
                }
            );
            break;

            default:
            message.channel.send("Too many arguments supplied.");
            break;
        }
    }
}