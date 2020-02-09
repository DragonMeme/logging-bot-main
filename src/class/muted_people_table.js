const Main_Table = require('./main_table');
const Sqlite3 = require('better-sqlite3');

module.exports = class Muted_People_Table extends Main_Table{
    /*
        This constructor does the following:
        - Create data folder directory if not exists.
        - Create table if table does not exist.
        - Takes control of the table of given table name.
        - (OPTIONAL) Prints human readable debug logs.
    */
    constructor(server_settings_table_name, table_name, debug){
        super(table_name, debug);

        let sql = "CREATE TABLE IF NOT EXISTS " ;
        sql += this.table_name + "(";
        sql += "guild_id TEXT NOT NULL, ";
        sql += "player_id TEXT NOT NULL, ";
        sql += "muted_until REAL NOT NULL, ";
        sql += "FOREIGN KEY(guild_id) REFERENCES ";
        sql += server_settings_table_name + "(guild_id) ON DELETE CASCADE)";

        this.initTable(sql);

        sql = "CREATE UNIQUE INDEX index_" + this.table_name + " ON ";
        sql += this.table_name + "(guild_id, player_id)";

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        db.prepare(sql).run();
        db.close();
    }

    selectMutedPersonList(player_id){
        let sql = "SELECT * FROM " + this.table_name;
        sql += " WHERE player_id = ?";

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });

        let list_player = db.prepare(sql).all([player_id]);
        db.close();
        return list_player;
    }

    selectListMutedPeople(guild_id){
        let sql = "SELECT * FROM " + this.table_name;
        sql += " WHERE guild_id = ?";

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });

        let list_player = db.prepare(sql).all([guild_id]);
        db.close();
        return list_player;
    }

    insertOrReplaceMutedTimer(guild_id, player_id, duration){
        let sql = "REPLACE INTO " + this.table_name + "(";
        sql += "guild_id, player_id, muted_until";
        sql += ") VALUES(?,?,?)";

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });

        db.prepare(sql).run([guild_id, player_id, String(duration)]);
        db.close();
    }

    // Delete a player muted only to that specific guild.
    deleteMutedPerson(guild_id, player_id){
        let sql = "DELETE FROM " + this.table_name;
        sql += " WHERE guild_id = ? AND player_id = ?";

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });

        db.prepare(sql).run([guild_id, player_id]);
        db.close();
    }

    // Deletes all muted people that are associated to a guild.
    deleteAllMutedPerson(guild_id){
        let sql = "DELETE FROM " + this.table_name;
        sql += " WHERE guild_id = ?";

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });

        db.prepare(sql).run([guild_id]);
        db.close();
    }
}

