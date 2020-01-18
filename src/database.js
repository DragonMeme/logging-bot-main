const Sqlite3 = require("better-sqlite3");
const fs = require('fs');

var dir = './data';

exports.initDB = function(client){
    var list_guild_id = [];
    var guild_to_add = [];
 
    client.guilds.forEach(guild => {
        let guild_id = String(guild.id)
        list_guild_id.push(guild_id);
    });

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        console.log("Creating data directory for database.");
    }

    // Make sure database processes are executed in series.
    // Since this is an initialising command, time is not an issue.
    console.log("\nAttempting to create table if it does not exist.");
    initServerSettingsDB();

    // Check that the guild is already added to database.
    console.log("\nLooking for missing servers to add to database.");
    guild_to_add = searchMissingGuildServerSettingsDB(list_guild_id);
     
    // Insert guild ids that is yet to be added.
    console.log("\nAdding missing servers to database.");
    createGuildServerSettingsDB(guild_to_add);
    console.log("New servers successfully added to database.")

    // Clear guilds that the bot is not in.
    console.log("\nRemoving any server that the bot is currently not in.")
    pruneServerSettingsDB(list_guild_id);

};

/*
    This function initialises a table.
*/
function initServerSettingsDB(){
    let db = new Sqlite3("data/server.db");

    let sql = "CREATE TABLE IF NOT EXISTS server_settings("
        + "guild_id TEXT UNIQUE NOT NULL, "
        + "mod_channel TEXT, "
        + "admin_channel TEXT)";

    db.prepare(sql).run();
    db.close();
    console.log("Table found/created.");
}

/*
    This function clears the database of any server that the bot is not in.
*/
function pruneServerSettingsDB(updated_list){
    let db = new Sqlite3("data/server.db");

    const sql = "SELECT guild_id FROM server_settings";

    let list_db_guilds = db.prepare(sql).all();

    db.close();

    list_db_guilds.forEach(guild => {
        let hasGuild = false;

        for(i = 0; i < updated_list.length; i++){
            if(guild.guild_id === updated_list[i]) {
                hasGuild = true;
                break;
            }
        }
        if(!hasGuild) {
            removeGuildServerSettingsDB([guild.guild_id]);
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
        let row = readGuildServerSettingsDB(guild, "G");
        if(!row){
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
    createGuildServerSettingsDB(list_guild);
};

exports.deleteGuild = function(list_guild){
    removeGuildServerSettingsDB(list_guild);
};

// Adds a list of guilds to the database.
function createGuildServerSettingsDB(list_guild){
    let db = new Sqlite3("data/server.db");
    let sql = "INSERT INTO server_settings(guild_id) VALUES(?)";

    const statement = db.prepare(sql);

    list_guild.forEach(guild => {
        statement.run(guild);
        console.log("Successfully added guild: " + guild + " to database.");
    });

    db.close();
}

// Deletes a list of guilds from the database.
function removeGuildServerSettingsDB(list_guild){
    let db = new Sqlite3("data/server.db");
    let sql = "DELETE FROM server_settings WHERE guild_id = ?";

    const statement = db.prepare(sql);

    list_guild.forEach(guild => {
        statement.run(guild);
        console.log("Successfully removed guild: " + guild + " from database.");
    })

    db.close();
}

// Read and return any ID present. The channel must be either "MOD" or "ADMIN"
function readGuildServerSettingsDB(guild, channel){
    let db = new Sqlite3("data/server.db");
    let sql = "SELECT ";
    switch(channel){
        case "MOD":
            sql += "mod_channel";
            break;
        case "ADMIN":
            sql += "admin_channel";
            break;
        default:
            sql += "guild_id";
    }
    sql += " FROM server_settings WHERE guild_id = ?";

    const statement = db.prepare(sql);

    var info = statement.get(guild);
    db.close();
    return info;
}

// Update any channel ID present. The channel must be either "MOD" or "ADMIN"
function updateGuildServerSettingsDB(guild, info, channel){
    
    if(channel === "MOD" || channel === "ADMIN"){
        let db = new Sqlite3("data/server.db");
        let sql = "UPDATE server_settings SET ";

        switch(channel){
            case "MOD":
                sql += "mod_channel";
                break;
            case "ADMIN":
                sql += "admin_channel";
                break;
        }
        sql += " = ? WHERE guild_id = ?";

        const statement = db.prepare(sql);

        statement.run(info, guild);
        db.close();
    }else{
        return;
    }
}
