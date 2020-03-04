const Main_Table = require("./main_table.js");
const Setting = require("../common/guild_setting.js")
const Sqlite3 = require("better-sqlite3");

/*
    The class stores rules as to which setting to post logs at.
*/
module.exports = class Guild_Settings_Table extends Main_Table{
    
    constructor(table_name, debug){
        super(table_name, debug);
        const list_keys = Setting.list_keys;

        // String constructor for creating and initialising a table.
        let sql = `CREATE TABLE IF NOT EXISTS "${this.table_name}"("${Setting.select_settings("G")}" TEXT UNIQUE NOT NULL, `;
        for(let i = 0; i < list_keys.length; i++){
            sql += `"${Setting.select_settings(list_keys[i])}" TEXT`;
            if((i + 1) < list_keys.length) sql += ", ";
            else sql += ")";
        }

        this.initTable(sql);
    }

    /*
        Adds a list of guilds to the database.
    */
    createGuild(list_guild){
        const sql = `INSERT INTO "${this.table_name}"("${Setting.select_settings("G")}") VALUES(?)`;

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const statement = db.prepare(sql);
        list_guild.forEach(guild => {
            statement.run(guild);
            if(this.debug) console.log(`Successfully added ${Setting.select_settings("G")} (${guild}) to database.`);
        });
        db.close();
    }

    /*
        Read and return the specified setting present. 
    */
    readGuild(guild, setting){
        const setting_type = Setting.select_settings(setting);
        const sql = `SELECT "${setting_type}" FROM "${this.table_name}" WHERE "${Setting.select_settings("G")}" = ?`;

        const db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const info = db.prepare(sql).get(guild);
        db.close();

        if(!info) return null;
        if(this.debug) console.log(`Obtained ${setting_type} (Value: ${info[setting_type]}) from database with ${Setting.select_settings("G")} ${guild}.`);
        return info[setting_type];
    }

    /*
        Update setting by setting channel ID. 
    */
    updateGuild(guild, info, setting){
        const setting_type = Setting.select_settings(setting);
        const sql = `UPDATE "${this.table_name}" SET "${setting_type}" = ? WHERE "${Setting.select_settings("G")}" = ?`;

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        db.prepare(sql).run(info, guild);
        db.close();

        if(this.debug) {
            console.log(`Updated ${setting_type} to ${Setting.select_settings("G")} "${guild}"`);
        }
    }

    /*
        Deletes a list of guilds from the database.
    */
    deleteGuild(list_guild){
        let sql = `DELETE FROM "${this.table_name}" WHERE "${Setting.select_settings("G")}" = ?`;

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const statement = db.prepare(sql);
        list_guild.forEach(guild => {
            statement.run(guild);
            if(this.debug) console.log(`Successfully removed guild with id "${guild}" from database.`);
        })

        db.close();
    }
}
