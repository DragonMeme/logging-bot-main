const Sqlite3 = require("better-sqlite3");
const fs = require("fs");

// Template class for constructing sql functionality.
module.exports = class Main_Table{
    /*
        This constructor does the following:
        - Create data folder directory if not exists.
        - Takes control of the table of given table name.
        - (OPTIONAL) Prints human readable debug logs.
    */
    constructor(table_name, debug){
        this.debug = debug;
        this.table_name = table_name;
        const dir = "./data";

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            if(this.debug) console.log(`Creating data directory for database.`);
        }
    }

    initTable(sql){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null});

        db.prepare(sql).run();
        db.close();

        if(this.debug) console.log(`Table ${this.table_name} found/created.`);
    }

    // Return all values present in database.
    readAllGuild(){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });

        const sql = `SELECT * FROM ${this.table_name}`;

        let list_db_guilds = db.prepare(sql).all();
        db.close();

        return list_db_guilds;
    }

    // Deletes the table.
    deleteAllGuild(){
        // Drop the indexing table.
        let sql = `DROP INDEX IF EXISTS index_${this.table_name}`;

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        db.prepare(sql).run();

        // Drop the entire table.
        sql = `DROP TABLE IF EXISTS ${this.table_name}`;
        db.prepare(sql).run();

        db.close();

        delete this;
    }
}