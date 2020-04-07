const { SettingTypesIndexes, StatusHeaders, SettingValues } = require("../common/guild_setting.json");
const { readData } = require("../database.js");

module.exports = {
	name: "statuslog",
	description: "Prints which channel the specific activities are being logged to.",
	examples: ["statuslog", "statuslog user"],
	permissionLevel: 2,
	parameters: {
		category: {
			requirement: false,
			description: "Choose the category of which logging types to show. Possible values include:\n" +
                `- \`${Object.keys(SettingTypesIndexes).join("`\n- `")}\`\n` +
                "Note that if no argument is supplied, `all` is used by default."
		}
	},
	execute(message, otherArguments){
		if(message.channel.type != "text") return;
		const guildID = message.guild.id;
		switch(otherArguments.length){
			case 0: {// No other arguments needed.
				const max = SettingTypesIndexes.all.max;
				const min = SettingTypesIndexes.all.min;
				message.channel.send(printStatusLog(max, min, guildID));
				break;
			}

			case 1: // One argument supplied.
				if(Object.keys(SettingTypesIndexes).includes(otherArguments[0])){
					const max = SettingTypesIndexes[otherArguments[0]].max;
					const min = SettingTypesIndexes[otherArguments[0]].min;
					message.channel.send(printStatusLog(max, min, guildID));
				}else message.channel.send(`Invalid logging category \`${otherArguments[0]}\`!`);
				break;

			default:
				message.channel.send("Too many arguments supplied.");
		}
	}
};

const printStatusLog = (max, min, guildID) => {
	const shortcutListSettingValues = Object.keys(SettingValues);
	let messageString = "Current channels for logging of specific activity:";
	for(let i = min; i < max; i++){
		if(Object.keys(StatusHeaders).includes(String(i))) 
			messageString += `\n__**${StatusHeaders[String(i)]}:**__\n`;
		const currentValue = Object.values(SettingValues)[i];
		const result = readData(guildID, shortcutListSettingValues[i]); // TODO: Get data from database.
		messageString += `${currentValue}: ${!result ? "Not Set!" : `<#${result}>`}\n`;
	}
	return messageString;
};