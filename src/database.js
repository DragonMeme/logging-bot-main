Guild_Setting_Table = require("./class/guild_settings_table.js");
Guild_Setting_Common = require("./common/guild_setting.js");

require("dotenv").config();

const author = String(process.env.AUTHOR_ID);
const g_setting = new Guild_Setting_Table("Server Settings", true);

exports.initDB = function(client){
    let list_guild_id = [];
    let guild_to_add = [];
 
    // Ensure to only add guilds that meet the pre-requisites.
    client.guilds.forEach(guild => {
        let guild_id = guild.id;

        // Leave any guild that does not meet the pre-requirements.
        if(guild.members.filter(member => !member.user.bot).size < 50){

            // The bot author is the only exception.
            if(guild.ownerID == author){
                list_guild_id.push(guild_id);
            }else{
                guild.leave();
            }

        }else{
            list_guild_id.push(guild_id);
        }
        
    });

    // Check that the guild is already added to database.
    console.log("\nLooking for missing servers to add to database.");
    guild_to_add = searchMissingGuildServerSettingsDB(list_guild_id);
     
    // Insert guild ids that is yet to be added.
    console.log("\nAdding missing servers to database.");
    g_setting.createGuild(guild_to_add);
    console.log("New servers successfully added to database.");

    // Clear guilds that the bot is not in.
    console.log("\nRemoving any server that the bot is currently not in.");
    pruneServerSettingsDB(list_guild_id);

};

/*
    This function clears the database of any server that the bot is not in.
*/
function pruneServerSettingsDB(updated_list){
    list_db_guilds = g_setting.readAllGuild();

    list_db_guilds.forEach(guild => {
        let guild_id  = guild[`${Guild_Setting_Common.select_settings("G")}`];
        if(!updated_list.includes(guild_id)) g_setting.deleteGuild([guild_id]);
    });
    console.log("Servers successfully removed.");
}

/* 
    This function compares guilds that the bot is in with the ones stored in database.
    Returns a list of the guild that was not added to the database.
*/
function searchMissingGuildServerSettingsDB(list_guild){
    let added_items = [];

    list_guild.forEach(guild => {
        let row = g_setting.readGuild(guild, "G");
        if(row == null){
            added_items.push(guild);
            console.log(`${Guild_Setting_Common.select_settings("G")} ${guild} not in database.`);
        }
    });

    console.log("All guilds that the bot is in have been searched!");
    return added_items;
}

/*
    CRUD Commands.
*/
exports.createGuild = function(list_guild){
    g_setting.createGuild(list_guild);
};

exports.readGuild = function(guild, setting){
    return g_setting.readGuild(guild, setting);
};

exports.updateGuild = function(guild, info, setting){
    g_setting.updateGuild(guild, info, setting);
};

exports.deleteGuild = function(list_guild){
    g_setting.deleteGuild(list_guild);
};
