const { readData, updateData } = require("../database.js");
const { SettingValues } = require("../common/guild_setting.json");
const { generateSetLogParameters } = require("../common/guild_setting.js");
const parameters = generateSetLogParameters;
const validParametersMap = Object.keys(SettingValues);

module.exports = {
	name: "setlog",
	description: "Allows the administrator to set current channel for the bot to log specific activity.",
	examples: ["setlog vc_joins true", "setlog message_delete"],
	guildOnly: true,
	permissionLevel: 2,
	parameters: {
		activityType: {
			requirement: true,
			description: "The type of activity the bot will log to. Acceptable values to be used in arguments include:"
				+ `\n- \`${parameters.join("`\n- `")}\``
		},
		toogle: {
			requirement: false,
			description: "Basically an on/off switch so acceptable values are \n- `on`\n- `off`."
		}
	},
	execute(message, otherArguments){
		switch(otherArguments.length){
			case 0: // No arguments supplied
				message.reply("You did not supply any arguments!");
				break;

			case 1: // 1 Argument supplied
			{
				const activityType = otherArguments[0].toLowerCase();
				const guildID = message.guild.id;
				const channelID = message.channel.id;
				if(parameters.includes(activityType)){ // Check for valid input.
					const setting = validParametersMap[parameters.indexOf(activityType)];
					if(readData(guildID, setting) === channelID){ // Turn off activity type.
						const inputData = [guildID, setting, null];
						updateData([inputData]);
						message.channel.send(`Activity Type \`${activityType}\` is now disabled!`);
					}else{ // Turn on activity type, ensure bot can send embed to said channel.
						if(message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")){
							if(setting === "BD"){
								if(message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")){
									const inputData = [guildID, setting, channelID];
									updateData([inputData]);
									message.channel.send(`Activity Type \`${activityType}\` is now set to this channel!`);
								}else{
									message.reply("Please grant me permission `ATTACH_FILES` in this channel!");
								}
							}else{
								const inputData = [guildID, setting, channelID];
								updateData([inputData]);
								message.channel.send(`Activity Type \`${activityType}\` is now set to this channel!`);
							}
						}else message.reply("Please grant me permission `EMBED_LINKS` in this channel!");
					}
				}else message.reply(`Invalid activityType \`${activityType}\``);
				break;
			}

			case 2: // 2 Arguments supplied
			{
				const toggle = otherArguments[1].toLowerCase();
				const activityType = otherArguments[0].toLowerCase();
				const guildID = message.guild.id;
				const channelID = message.channel.id;
				if(parameters.includes(activityType)){ // Check for valid input.
					const setting = validParametersMap[parameters.indexOf(activityType)];
					if(toggle === "on"){
						if(readData(guildID, setting) === channelID){ // Invalid scenario.
							message.reply("That activity type is already set to this channel!");
						}else{ // Valid scenario as we are changing data, ensure bot can send embed to said channel.
							if(message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")){
								const inputData = [guildID, setting, channelID];
								updateData([inputData]);
								message.channel.send(`Activity Type \`${activityType}\` is now set to this channel!`);
							}else message.reply("Please grant me permission `EMBED_LINKS` in this channel!");
						}
					}else if(toggle === "off"){
						if(!readData(guildID, setting)){ // Invalid scenario.
							message.reply("That activity type is already disabled!");
						}else{ // Valid scenario as we are disabling this activity type.
							const inputData = [guildID, setting, null];
							updateData([inputData]);
							message.channel.send(`Activity Type \`${activityType}\` is now disabled!`);
						}
					}else message.reply(`Invalid toogle value \`${toggle}\``);
				}else message.reply(`Invalid activityType \`${activityType}\``);
				break;
			}

			default:
				message.reply("You supplied too many arguments!");
		}
	}
};
