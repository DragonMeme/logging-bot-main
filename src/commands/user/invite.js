const Command = require("../command.js");
const discord = require("discord.js");

require("dotenv").config();

module.exports = class invite extends Command{
    constructor(message, argumentList, client){
        super(message, argumentList);
        this.invite = process.env.MAIN_SERVER_LINK;
        this.partInviteLink = "https://discordapp.com/api/oauth2/authorize";
        this.clientID = client.user.id;
    }

    execute(){
        switch(this.otherArguments.length){
            case 0: // No other arguments needed.
            this.message.react("🤔");
            const embed = new discord.RichEmbed()
                .setColor("#00FFFF")
                .setTitle("Click here to invite me!")
                .setURL(`${this.partInviteLink}?client_id=${this.clientID}&permissions=268495958&scope=bot`);
            this.message.author.send(embed);
            break;

            default:
            this.sendSentTooManyArgumentsError();
            break;
        }
    }
}
