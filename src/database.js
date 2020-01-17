const Sqlite3 = require("better-sqlite3");

exports.initDB = function(client){
    var list_guild_id = [];
    var guild_to_add = [];
 
    client.guilds.forEach(guild => {
        let guild_id = String(guild.id)
        list_guild_id.push(guild_id);
    });

    // Make sure database processes are executed in series.
    // Since this is an initialising command, time is not an issue.
    initServerSettingsDB();

    // Check that the guild is already added to database.
    guild_to_add = searchMissingGuildServerSettingsDB(list_guild_id);
     
    // Insert guild ids that is yet to be added.
    createGuildServerSettingsDB(guild_to_add);

    // Clear guilds that the bot is not in.
    pruneServerSettingsDB(list_guild_id);

};

/*
    This function initialises a table.
*/
function initServerSettingsDB(){
    let db = new Sqlite3("server.db", {verbose: console.log});

    let sql = "CREATE TABLE IF NOT EXISTS server_settings("
        + "guild_id TEXT UNIQUE NOT NULL, "
        + "mod_channel TEXT, "
        + "admin_channel TEXT)";

    db.prepare(sql).run();
    db.close();
}

/*
    This function clears the database of any server that the bot is not in.
*/
function pruneServerSettingsDB(updated_list){
    let db = new Sqlite3("server.db", {verbose: console.log});

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
        if(!hasGuild) removeGuildServerSettingsDB([guild.guild_id]);
    });
}

/* 
    This function compares guilds that the bot is in with the ones stored in database.
    Returns a list of the guild that was not added to the database.
*/
function searchMissingGuildServerSettingsDB(list_guild){
    let added_items = [];

    list_guild.forEach(guild => {
        let row = readGuildServerSettingsDB(guild, "G")
        if(!row){
            added_items.push(guild);
        }
    });

    return added_items;
}

/*
    CRUD Commands.
*/

// Adds a list of guilds to the database.
function createGuildServerSettingsDB(list_guild){
    let db = new Sqlite3("server.db", {verbose: console.log});
    let sql = "INSERT INTO server_settings(guild_id) VALUES(?)";

    const statement = db.prepare(sql);

    list_guild.forEach(guild => {
        statement.run(guild);
    })

    db.close();
}

// Deletes a list of guilds from the database.
function removeGuildServerSettingsDB(list_guild){
    let db = new Sqlite3("server.db", {verbose: console.log});
    let sql = "DELETE FROM server_settings WHERE guild_id = ?";

    const statement = db.prepare(sql);

    list_guild.forEach(guild => {
        statement.run(guild);
    })

    db.close();
}

// Read and return any ID present. The channel must be either "MOD" or "ADMIN"
function readGuildServerSettingsDB(guild, channel){
    let db = new Sqlite3("server.db", {verbose: console.log});
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
        let db = new Sqlite3("server.db", {verbose: console.log});
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
