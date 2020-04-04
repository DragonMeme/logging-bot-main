const { RichEmbed } = require("discord.js");

module.exports = {
    name: "invite",
    description: "DMs you a hyperlink to invite the bot.",
    examples: ["invite"],
    permissionLevel: 0,
    parameters: {},
    execute(message, otherArguments){
        const { invite } = require("../../data/config.json");
        if(!["text", "dm"].includes(message.channel.type)) return;
        switch(otherArguments.length){
            case 0: // No other arguments needed.
            const embed = new RichEmbed()
            .setColor("#00FFFF")
            .setTitle("Click here to invite me!")
            .setURL(invite);
            message.channel.send(embed);
            break;

            default:
            message.channel.send("Too many arguments supplied.");
            break;
        }
    }
}