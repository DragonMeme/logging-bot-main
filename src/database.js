guildSettingTableClass = require("./table/guild_settings_table.js");
guildSettingCommon = require("./common/guild_setting.js");

require("dotenv").config();

const author = process.env.AUTHOR_ID;
const guildSettingTable = new guildSettingTableClass("Server Settings", true);
const guildIDTitle = guildSettingCommon.selectSettings("G");

exports.initDB = function(client){
    let listGuildID = [];
    let guildToAddToDatabase = [];
    
    client.guilds.forEach(
        guild => {// Ensure to only add guilds that meet the pre-requisites.
            let guildID = guild.id;
            if(guild.members.filter(member => !member.user.bot).size < 50){
                if(guild.ownerID == author){ // The bot author is the only exception.
                    listGuildID.push(guildID);
                }else{
                    guild.leave();
                }
            }else{
                listGuildID.push(guildID);
            }
        }
    );
    console.log("\nLooking for missing servers to add to database.");
    guildToAddToDatabase = searchMissingGuildServerSettingsDB(listGuildID);
    console.log("\nAdding missing servers to database.");
    guildSettingTable.createGuild(guildToAddToDatabase);
    console.log("New servers successfully added to database.");
    console.log("\nRemoving any server that the bot is currently not in.");
    pruneServerSettingsDB(listGuildID);
};

/*
    This function clears the database of any server that the bot is not in.
*/
function pruneServerSettingsDB(updatedList){
    listGuildsInDatabase = guildSettingTable.readAllGuild();
    listGuildsInDatabase.forEach(guild => {
        let guildID  = guild[`${guildIDTitle}`];
        if(!updatedList.includes(guildID)){
            guildSettingTable.deleteGuild([guildID]);
        }
    });
    console.log("Servers successfully removed.");
}

/* 
    This function compares guilds that the bot is in with the ones stored in database.
    Returns a list of the guild that was not added to the database.
*/
function searchMissingGuildServerSettingsDB(listGuild){
    let addedItems = [];
    listGuild.forEach(guild => {
        let row = guildSettingTable.readGuild(guild, "G");
        if(row == null){
            addedItems.push(guild);
            console.log(`${guildIDTitle} ${guild} not in database.`);
        }
    });
    console.log("All guilds that the bot is in have been searched!");
    return addedItems;
}

/*
    CRUD Commands.
*/
exports.createGuild = function(listGuild){
    guildSettingTable.createGuild(listGuild);
};
exports.readGuild = function(guild, setting){
    return guildSettingTable.readGuild(guild, setting);
};
exports.updateGuild = function(guild, info, setting){
    guildSettingTable.updateGuild(guild, info, setting);
};
exports.deleteGuild = function(listGuild){
    guildSettingTable.deleteGuild(listGuild);
};
