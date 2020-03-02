const Main_Table = require("./main_table");
const Setting = require("../common/setting.js")
const Sqlite3 = require("better-sqlite3");

/*
    The class stores rules as to which setting to post logs at.
*/
module.exports = class Guild_Settings_Table extends Main_Table{
    
    constructor(table_name, debug){
        super(table_name, debug);
        const list_setting = Setting.list_settings;

        // String constructor for creating and initialising a table.
        let sql = `CREATE TABLE IF NOT EXISTS ${this.table_name}(guild_id TEXT UNIQUE NOT NULL, `;
        for(let i = 0; i < list_setting.length; i++){
            sql += `${Setting.select_settings(list_setting[i])} TEXT`;
            if((i + 1) < list_setting.length) sql += ", ";
            else sql += ")";
        }

        this.initTable(sql);
    }

    /*
        Adds a list of guilds to the database.
    */
    createGuild(list_guild){
        let sql = `INSERT INTO ${this.table_name} (guild_id) VALUES(?)`;

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const statement = db.prepare(sql);
        list_guild.forEach(guild => {
            statement.run(guild);
            if(this.debug) console.log(`Successfully added guild_id ${guild} to database.`);
        });
        db.close();
    }

    /*
        Read and return the specified setting present. 
    */
    readGuild(guild, setting){
        let setting_type = Setting.select_settings(setting);
        let sql = `SELECT ${setting_type} FROM ${this.table_name} WHERE guild_id = ?`;

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const info = db.prepare(sql).get(guild);
        db.close();

        if(!info) return null;
        if(this.debug) console.log(`Obtained ${setting_type} from database with guild_id ${guild} and value of ${info[setting_type]}`);
        if(!info[setting_type]) return "Not Currently Set!"
        return info[setting_type];
    }

    /*
        Update setting by setting channel ID. 
    */
    updateGuild(guild, info, setting){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        let setting_type = Setting.select_settings(setting);
        let sql = `UPDATE ${this.table_name} SET ${setting_type} = ? WHERE guild_id = ?`;

        db.prepare(sql).run(info, guild);
        db.close();

        if(this.debug) {
            console.log(`Updated ${setting_type} to guild_id ${guild}`);
        }
    }

    /*
        Deletes a list of guilds from the database.
    */
    deleteGuild(list_guild){
        let sql = `DELETE FROM ${this.table_name} WHERE guild_id = ?`;

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const statement = db.prepare(sql);
        list_guild.forEach(guild => {
            statement.run(guild);
            if(this.debug) console.log(`Successfully removed guild: ${guild} from database.`);
        })

        db.close();
    }
}
