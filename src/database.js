const Guild_Setting = require("./table/guild_settings.js");
const { DefaultSettingValue } = require("./common/guild_setting.json");
const { consoleLogTime } = require("./common/logger.js");
const { isGuildOwner } = require("./common/permission_check.js");

const guildSettingTable = new Guild_Setting("Server Settings");
const invalidGuildList = [];

module.exports = {
	initialise : function(client){
		const listGuildID = [];
		/*
            Search the guilds that the bot currently is in.
            The bot will automatically leave any server that does not meet the requisites.
            As for the guilds that meet the requisites, the id is added to listGuildID.
        */
		consoleLogTime("=>  Looking for missing servers to add to database.");
		client.guilds.forEach(
			guild => {
				const guildID = guild.id;
				if(guild.members.filter(member => !member.user.bot).size < 50){
					if(isGuildOwner(guild, "owner")) listGuildID.push(guildID); 
					else {
						invalidGuildList.push(guildID);
						consoleLogTime(`Guild ID "${guildID}" does not meet the pre-requisite so not added.`);
					}
				}else listGuildID.push(guildID);
			}
		);
		consoleLogTime("All guilds that the bot is in has been checked and some may leave servers!");
        
		/*
            Check the database and see whether the entry from listGuildID exists or not.
            Add missing GuildID to database if needed.
        */
		consoleLogTime("=>  Attempting to add missing guilds to the database.");
		listGuildID.forEach(guild => {
			if(!guildSettingTable.readData(guild, "G")){
				guildSettingTable.createData([guild]);
				consoleLogTime(`${DefaultSettingValue}: ${guild} was not in database. It is now added!`);
			}
		});
		consoleLogTime("New servers successfully added to database.");

		/*
            Prune any guild in the database that the the bot is no longer part of.
            This is used to save space.
        */
		consoleLogTime("=>  Removing any server information that the bot is currently not in from database.");
		guildSettingTable.readDataBase().forEach(guild => {
			const guildID = guild[`${DefaultSettingValue}`];
			if(!listGuildID.includes(guildID)){
				guildSettingTable.deleteData([guildID]);
				consoleLogTime(`${DefaultSettingValue}: ${guildID} is removed from the database.`);
			}
		});
		consoleLogTime("Redundant guild information have been successfully pruned from database!");
	},
	invalidGuildList : function(){
		return invalidGuildList.splice(0, invalidGuildList.length);
	},

	/*
        CRUD Commands.
    */
	createData : function(listGuildID){
		guildSettingTable.createData(listGuildID);
	},
	readData : function(guildID, setting){
		return guildSettingTable.readData(guildID, setting);
	},
	updateData : function(guildID, setting, data){
		guildSettingTable.updateData(guildID, setting, data);
	},
	deleteData : function(listGuildID){
		guildSettingTable.deleteData(listGuildID);
	}
};




