const { readdirSync } = require("fs");
const { isBotOwner } = require("../common/permission_check.js");

module.exports = {
	name: "help",
	description: "DMs you about the command(s) the bot can do.",
	examples: ["help", "help ping"],
	permissionLevel: 0,
	parameters: {
		command: {
			requirement: false,
			description: "Supplies you the required information on a specific supported command. " +
            `All supported commands can be checked by typing the command \`${process.env.PREFIX}help\`.`
		}
	},
	execute(message, otherArguments){
		if(!["text", "dm"].includes(message.channel.type)) return;
		switch(otherArguments.length){
			case 0: {// No supplied arguments.
				let helpMessage = `**__${message.client.user.username} Help!__**\n`
                + "Arguments closed with `[]` are optional.\nArguments closed with `<>` are required.\n"
                + `Do not add \`[]\` and \`<>\` to your arguments (e.g. \`${process.env.PREFIX}help ping\`).\n\n`;
            
				readdirSync("./src/commands/").filter(file => file.endsWith(".js")).forEach(
					file => {
						const { description, name, permissionLevel, parameters } = require(`./${file}`);
						let usageString = `${process.env.PREFIX}${name}`;
						Object.keys(parameters).forEach(
							parameter => {
								if(parameters[parameter].requirement) usageString += ` <${parameter}>`;
								else usageString += ` [${parameter}]`;
							}
						);
						const commandUsageModule = `\`${usageString}\` - ${description}\n`;
						if((helpMessage + commandUsageModule).length > 2000){
							message.channel.send(helpMessage);
							helpMessage = "";
						}
						if(permissionLevel < 3 || isBotOwner(message.author)) // Restrict users from seeing bot owner commands
							helpMessage += commandUsageModule;
						return helpMessage;
					}
				);
				message.channel.send(helpMessage).then(() => message.react("🤔").catch());
				break;
			}
            
			case 1: {// Has an argument.
				const argument = otherArguments[0];
				try{
					require.resolve(`./${argument.toLowerCase()}`); 
					const { description, examples, name, permissionLevel, parameters } = require(`./${argument.toLowerCase()}`);

					// Ensure that users do not see bot owner commands and treat as non-existent command. Only the bot author may see bot-owner command.
					if(!isBotOwner(message.author) && permissionLevel == 3) throw Error("Cannot Find Command!");
                
					let helpMessage = `**__COMMAND: ${name}__**\n${description}\n\n**Permission Level**: `;

					switch(permissionLevel){
						case 3:
							helpMessage += "Bot Host";
							break;

						case 2:
							helpMessage += "Administrator";
							break;

						case 1:
							helpMessage += "Moderator";
							break;

						default:
							helpMessage += "User";
							break;
					}

					// Usage string maker.
					let usageString = `${process.env.PREFIX}${name}`;
					Object.keys(parameters).forEach(
						parameter => {
							if(parameters[parameter].requirement) usageString += ` <${parameter}>`;
							else usageString += ` [${parameter}]`;
						}
					);
					helpMessage += `\n**Usage**: \`${usageString}\``;

					// Add explanation of each parameter.
					Object.keys(parameters).forEach(
						parameter => {
							const requirementString = parameters[parameter].requirement ? "REQUIRED" : "OPTIONAL";
							const descriptionString = parameters[parameter].description;
							const argumentDescription = `Requirement: *${requirementString}*\n${descriptionString}`;
							helpMessage += `\n\n**Argument Parameter**: __${parameter}__\n${argumentDescription}`;
						}
					);

					// Add example of command usage.
					let exampleString = "";
					examples.forEach(example => exampleString += `\`${process.env.PREFIX}${example}\`\n`);

					if(exampleString.length > 0) 
						helpMessage += `\n\n**${examples.length == 1 ? "Example Usage": "Example Usages"}**\n${exampleString}`;

					message.channel.send(helpMessage).then(() => message.react("🤔").catch());
                
				}catch(e){
					if(e.message.toLowerCase().includes("cannot find")) // Invalid argument case.
						message.channel.send(`Sorry, I do not support command \`${argument}\``);
				}
				break;
			}
            
			default: 
				message.channel.send("Too many arguments supplied.");
		}
	}
};