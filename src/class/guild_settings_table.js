const Main_Table = require("./main_table.js");
const guildSetting = require("../common/guild_setting.js")
const sqlite3 = require("better-sqlite3");
const guildIDTitle = guildSetting.selectSettings("G");

/*
    The class stores rules as to which setting to post logs at.
*/
module.exports = class Guild_Settings_Table extends Main_Table{
    
    constructor(tableName, debug){
        super(tableName, debug);
        const listKeys = guildSetting.listKeysSettingValues;
        // String constructor for creating and initialising a table.
        let sql = `CREATE TABLE IF NOT EXISTS "${this.tableName}"("${guildIDTitle}" TEXT UNIQUE NOT NULL, `;
        for(let i = 0; i < listKeys.length; i++){
            sql += `"${guildSetting.selectSettings(listKeys[i])}" TEXT`;
            if((i + 1) < listKeys.length) sql += ", ";
            else sql += ")";
        }
        this.initTable(sql);
    }

    /*
        Adds a list of guilds to the database.
    */
    createGuild(listGuild){
        const sql = `INSERT INTO "${this.tableName}"("${guildIDTitle}") VALUES(?)`;
        const db = new sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const statement = db.prepare(sql);
        listGuild.forEach(guild => {
            statement.run(guild);
            if(this.debug) console.log(`Successfully added ${guildIDTitle} (${guild}) to database.`);
        });
        db.close();
    }

    /*
        Read and return the specified setting present. 
    */
    readGuild(guild, setting){
        const settingType = guildSetting.selectSettings(setting);
        const sql = `SELECT "${settingType}" FROM "${this.tableName}" WHERE "${guildIDTitle}" = ?`;
        const db = new sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const info = db.prepare(sql).get(guild);
        db.close();
        if(!info){
            return null;
        }
        if(this.debug){
            console.log(`Obtained ${settingType} (Value: ${info[settingType]}) from database with ${guildIDTitle} ${guild}.`);
        }
        return info[settingType];
    }

    /*
        Update setting by setting channel ID. 
    */
    updateGuild(guild, info, setting){
        const settingType = guildSetting.selectSettings(setting);
        const sql = `UPDATE "${this.tableName}" SET "${settingType}" = ? WHERE "${guildIDTitle}" = ?`;
        const db = new sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        db.prepare(sql).run(info, guild);
        db.close();

        if(this.debug){
            console.log(`Updated ${settingType} to ${guildIDTitle} "${guild}"`);
        }
    }

    /*
        Deletes a list of guilds from the database.
    */
    deleteGuild(listGuild){
        const sql = `DELETE FROM "${this.tableName}" WHERE "${guildIDTitle}" = ?`;

        const db = new sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const statement = db.prepare(sql);
        listGuild.forEach(guild => {
            statement.run(guild);
            if(this.debug){
                console.log(`Successfully removed guild with id "${guild}" from database.`);
            }
        });

        db.close();
    }
}
