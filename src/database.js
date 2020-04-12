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
		const guildToAdd = [];
		const currentGuildDB = [];
		guildSettingTable.readDataBase().forEach(guildRow => {
			currentGuildDB.push(guildRow[0]);
		});
		listGuildID.forEach(guild => {
			if(!currentGuildDB.includes(guild)){
				guildToAdd.push(guild);
				consoleLogTime(`${DefaultSettingValue}: ${guild} was not in database. It is now queued!`);
			}
		});
		if(guildToAdd.length > 0) guildSettingTable.createData(guildToAdd);
		consoleLogTime("New servers successfully added to database.");

		/*
            Prune any guild in the database that the the bot is no longer part of.
            This is used to save space.
        */
		consoleLogTime("=>  Removing any server information that the bot is currently not in from database.");
		const databaseToRemove = [];
		guildSettingTable.readDataBase().forEach(guild => {
			const guildID = guild[0];
			if(!listGuildID.includes(guildID)){
				databaseToRemove.push(guildID);
				consoleLogTime(`${DefaultSettingValue}: ${guildID} is queued for removal from the database.`);
			}
		});
		if(databaseToRemove > 0) guildSettingTable.deleteData(databaseToRemove);
		consoleLogTime("Redundant guild information have been successfully pruned from database!");
	},

	invalidGuildList : function(){
		return invalidGuildList.splice(0, invalidGuildList.length);
	},

	readDataRow : function(guildID){
		return guildSettingTable.readDataRow(guildID);
	},

	// CRUD Commands.
	createData : function(listGuildID){
		guildSettingTable.createData(listGuildID);
	},

	readData : function(guildID, setting){
		return guildSettingTable.readData(guildID, setting);
	},

	updateData : function(listData){
		guildSettingTable.updateData(listData);
	},

	deleteData : function(listGuildID){
		guildSettingTable.deleteData(listGuildID);
	}
};
