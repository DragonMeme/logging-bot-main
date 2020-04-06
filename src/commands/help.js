const { RichEmbed } = require("discord.js");
const { readdirSync } = require("fs");
const { isBotOwner } = require("../common/permissionCheck.js")

module.exports = {
    name: "help",
    description: "DMs you about the command(s) the bot can do.",
    examples: ["help", "help ping"],
    permissionLevel: 0,
    parameters: {
        command: {
            requirement: false,
            description: `Supplies you the required information on a specific supported command. \
            All supported commands can be checked by typing the command \`${process.env.PREFIX}help\`.`
        }
    },
    execute(message, otherArguments){
        if(!["text", "dm"].includes(message.channel.type)) return;
        switch(otherArguments.length){
            case 0: // No supplied arguments.
            const embed = new RichEmbed()
            .setColor("#00FFFF")
            .setTitle(`${message.client.user.username} Help! (Click here to join the support server)`)
            .setURL(process.env.MAIN_SERVER_LINK)
            .setDescription(`Arguments closed with \`[]\` are optional.\nArguments closed with \`<>\` are required.\nDo not add \`[]\` and \`<>\` to your arguments (e.g. \`${process.env.PREFIX}help ping\`).\n`);
            
            readdirSync("./src/commands/").filter(file => file.endsWith(".js")).forEach(
                file => {
                    const { description, name, permissionLevel, parameters } = require(`./${file}`);
                    let usageString = `${process.env.PREFIX}${name}`
                    Object.keys(parameters).forEach(
                        parameter => {
                            if(parameters[parameter].requirement) usageString += ` <${parameter}>`;
                            else usageString += ` [${parameter}]`;
                        }
                    )
                    if(permissionLevel < 3) // Restrict users from seeing bot owner commands
                        return embed.addField(name, `Usage: \`${usageString}\`\n${description}`);
                    if(isBotOwner(message)) // Unless the requester is the bot owner.
                        return embed.addField(name, `Usage: \`${usageString}\`\n${description}`);
                }
            );
            return message.author.send(embed)
            .then(() => message.react("🤔"))
            .catch(() => message.reply("I am unable to send you a direct message!"));

            case 1: // Has an argument.
            try{
                const argument = otherArguments[0];
                require.resolve(`./${argument}`); 
                const { description, examples, permissionLevel, parameters } = require(`./${argument}`);

                // Ensure that users do not see bot owner commands and treat as non-existent command. Only the bot author may see bot-owner command.
                if(!isBotOwner(message) && permissionLevel == 3) throw Error("Cannot Find Command!");
                
                const embed = new RichEmbed()
                .setColor("#00FFFF")
                .setTitle(`COMMAND: ${argument}`)
                .setDescription(description);

                switch(permissionLevel){
                    case 3:
                    embed.addField("Permission level", "Bot Host");
                    break;

                    case 2:
                    embed.addField("Permission level", "Administrator");
                    break;

                    case 1:
                    embed.addField("Permission level", "Moderator");
                    break;

                    default:
                    embed.addField("Permission level", "User");
                    break;
                }

                // Usage string maker.
                let usageString = `${process.env.PREFIX}${argument}`
                Object.keys(parameters).forEach(
                    parameter => {
                        if(parameters[parameter].requirement) usageString += ` <${parameter}>`;
                        else usageString += ` [${parameter}]`;
                    }
                )
                embed.addField("Usage", `\`${usageString}\``);

                // Add explanation of each parameter.
                Object.keys(parameters).forEach(
                    parameter => {
                        const requirementString = parameters[parameter].requirement ? "REQUIRED" : "OPTIONAL";
                        const descriptionString = parameters[parameter].description;
                        const argumentDescription = `Requirement: **${requirementString}**\n${descriptionString}`;
                        embed.addField(`Argument Parameter: ${parameter}`, argumentDescription);
                    }
                )

                // Add example of command usage.
                let exampleString = "";
                examples.forEach(
                    example => {
                        exampleString += `\`${process.env.PREFIX}${example}\`\n`;
                    }
                )
                if(exampleString.length > 0) {
                    embed.addField(examples.length == 1 ? "Example Usage": "Example Usages", exampleString);
                }
                return message.author.send(embed).then(() => message.react("🤔")).catch(e => {
                    message.reply("I am unable to send you a direct message!");
                    console.log(e.message)
                });
                
            }catch(e){
                if(e.message.toLowerCase().includes("cannot find")) // Invalid argument case.
                    return message.channel.send(`Sorry, I do not support command \`${argument}\``);
            }
            break;

            default: 
            return message.channel.send("Too many arguments supplied.");
        }
    }
}