const Guild_Setting = require("./table/guild_settings.js");
const { DefaultSettingValue } = require("./common/guild_setting.json");
const { logTime } = require("./common/logger.js");
const { isGuildOwner } = require("./common/permissionCheck.js")

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
        logTime("=>  Looking for missing servers to add to database.");
        client.guilds.forEach(
            guild => {
                const guildID = guild.id;
                if(guild.members.filter(member => !member.user.bot).size < 50){
                    if(isGuildOwner(guild, "owner")) listGuildID.push(guildID); 
                    else {
                        invalidGuildList.push(guildID);
                        logTime(`    Guild ID "${guildID}" does not meet the pre-requisite so not added.`);
                    }
                }else listGuildID.push(guildID);
            }
        );
        logTime("    All guilds that the bot is in has been checked and some may leave servers!");
        
        /*
            Check the database and see whether the entry from listGuildID exists or not.
            Add missing GuildID to database if needed.
        */
    logTime("=>  Attempting to add missing guilds to the database.");
        listGuildID.forEach(guild => {
            if(!guildSettingTable.readData(guild, "G")){
                guildSettingTable.createData([guild]);
                logTime(`    ${DefaultSettingValue}: ${guild} was not in database. It is now added!`);
            }
        });
        logTime("    New servers successfully added to database.");

        /*
            Prune any guild in the database that the the bot is no longer part of.
            This is used to save space.
        */
        logTime("=>  Removing any server information that the bot is currently not in from database.");
        guildSettingTable.readDataBase().forEach(guild => {
            const guildID = guild[`${DefaultSettingValue}`];
            if(!listGuildID.includes(guildID)) {
                guildSettingTable.deleteData([guildID]);
                logTime(`    ${DefaultSettingValue}: ${guildID} is removed from the database.`);
            }
        });
        logTime("    Redundant guild information have been successfully pruned from database!");
    },
    invalidGuildList : function(){
        return invalidGuildList.splice(0, invalidGuildList.length);
    },

    /*
        CRUD Commands.
    */
    createData : function(listGuild){
        guildSettingTable.createData(listGuild);
    },
    readData : function(guild, setting){
        return guildSettingTable.readData(guild, setting);
    },
    updateData : function(guild, setting, data){
        guildSettingTable.updateData(guild, setting, data);
    },
    deleteData : function(listGuild){
        guildSettingTable.deleteData(listGuild);
    }
}




