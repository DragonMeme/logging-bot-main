const Guild_Setting = require('./class/guild_settings_table.js');

var g_setting;

exports.initDB = function(client){
    var list_guild_id = [];
    var guild_to_add = [];
 
    client.guilds.forEach(guild => {
        let guild_id = String(guild.id);
        list_guild_id.push(guild_id);
    });

    // Since this is an initialising command, time is not an issue.
    console.log("\nAttempting to create table if it does not exist.");
    g_setting = new Guild_Setting("server_settings", false);

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
        let hasGuild = false;

        for(i = 0; i < updated_list.length; i++){
            if(guild.guild_id === updated_list[i]) {
                hasGuild = true;
                break;
            }
        }
        if(!hasGuild) {
            g_setting.deleteGuild([guild.guild_id]);
        }
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
            console.log("Guild ID: " + guild + " not in database.");
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

exports.readGuild = function(guild, channel){
    return g_setting.readGuild(guild, channel);
};

exports.updateGuild = function(guild, info, channel){
    g_setting.updateGuild(guild, info, channel);
};

exports.deleteGuild = function(list_guild){
    g_setting.deleteGuild(list_guild);
};
