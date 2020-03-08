const Command = require("../command.js");
const discord = require("discord.js");

require("dotenv").config();

module.exports = class help extends Command{
    constructor(message, argumentList, prefix){
        super(message, argumentList);
        this.prefix = prefix;
        this.jsonData = require("./help.json");
        this.guildSetting = require("../../common/guild_setting.js");
        this.jsonValuesHelpArguments = Object.keys(this.jsonData);
    }

    execute(){
        switch(this.otherArguments.length){
            case 0: // No second argument.
            this.message.react("🤔");
            const embed = new discord.RichEmbed()
            .setColor("#00FFFF")
            .setTitle("Hyo Bot Help! (Click here to join the support server)")
            .setDescription(this.getMainDescription());
            if(process.env.MAIN_SERVER_LINK != null){
                embed.setURL(process.env.MAIN_SERVER_LINK);
            }
            this.jsonValuesHelpArguments.forEach(
                argument => {
                    const usage = this.getParameter(argument, "Usage");
                    const shortDescription = this.getParameter(argument, "Short Description");
                    embed.addField(`${this.prefix}${usage}`, shortDescription);
                }
            );
            this.message.author.send(embed);
            break;

            case 1: // Has a second argument.
            const secondArgument = this.otherArguments[0];
            if(this.jsonValuesHelpArguments.includes(secondArgument)){
                this.message.react("🤔");
                const usage = this.getParameter(secondArgument, "Usage");
                const showExamples = this.getParameter(secondArgument, "Examples");
                const splitUsage = usage.split(" ").slice(1); // Since first argument is main
                const embed = new discord.RichEmbed()
                .setColor("#00FFFF").setTitle(`COMMAND: ${secondArgument}`)
                .setDescription(this.getParameter(secondArgument, "Long Description"))
                .addField("Permission Level", this.getParameter(secondArgument, "Permission"))
                .addField("Usage", `\`${this.prefix}${usage}\``);
                let showExampleString = "";
                splitUsage.forEach(
                    argumentPart => { // Each variable argument has its own fields.
                        const descriptionArgument = this.getParameter(secondArgument, argumentPart);
                        const overallDescription = `${argumentPart.startsWith("[") ? "OPTIONAL" : "REQUIRED"}: ${descriptionArgument}`;
                        embed.addField(argumentPart, overallDescription);
                    }
                );
                showExamples.forEach(
                    example => {
                        showExampleString += `\`${this.prefix}${example}\`\n`;
                    }
                );
                if(showExamples.length > 0){
                    embed.addField(`Example${showExamples.length === 1 ? "":"s"}`, showExampleString);
                }
                this.message.author.send(embed);
            }else{ // Unsupported commands for user.
                const messageString = `Sorry, I do not process command \`${secondArgument}\``;
                sendError(messageString);
            }
            break;

            default: // Too many arguments.
            const messageString = "Too many arguments for command `help`!";
            sendError(messageString);
            break;
        }
    }

    getMainDescription(){
        return "Arguments closed with `[]` are optional.\n" + 
        "Arguments closed with `<>` are required.\n" + 
        `Do not add \`[]\` and \`<>\` to your arguments (e.g. \`${this.prefix}setlog user_deletes on\`).`;
    }

    getParameter(argument, parameter){
        if(!this.jsonData[argument][parameter]){
            return null;
        }else{
            let constructActivityDescription = this.jsonData[argument][parameter];
            if(argument === "quicksetlog"){ // Special case for quicksetlog.
                if(parameter === "<option>"){
                    const jsonQuickSetLog = this.jsonData[argument]["extraOption"]; // Type is a map.
                    const jsonQuickSetLogKeys = Object.keys(jsonQuickSetLog);
                    jsonQuickSetLogKeys.forEach(
                        key => {
                            constructActivityDescription += `\n- \`${key}\` = ${jsonQuickSetLog[key]}`;
                        }
                    )
                }
            }else if(argument === "setlog"){ // Special case of setlog.
                if(parameter === "<activity>"){ 
                    let settingValueResults = this.jsonData[argument]["extraOption"]; // Type is a list.
                    settingValueResults.sort();
                    settingValueResults.forEach(
                        settingValueResult => {
                            constructActivityDescription += `\n- \`${settingValueResult}\``;
                        }
                    )
                }
            }
            return constructActivityDescription;
        }
    }
}
