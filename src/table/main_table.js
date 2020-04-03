const sqlite3 = require("better-sqlite3");
const fs = require("fs");

// Template class for constructing sql functionality.
module.exports = class Main_Table{
    /*
        This constructor does the following:
        - Create data folder directory if not exists.
        - Takes control of the table of given table name.
        - (OPTIONAL) Prints human readable debug logs.
    */
    constructor(tableName, debug){
        this.debug = debug;
        this.tableName = tableName;
        const dir = "./data";
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            if(this.debug){
                console.log(`Creating data directory for database.`);
            }
        }
    }

    initTable(sql){
        const db = new sqlite3("data/server.db", {"verbose": this.debug ? console.log : null});
        db.prepare(sql).run();
        db.close();
        if(this.debug){
            console.log(`Table "${this.tableName}" found/created.`);
        }
    }

    // Return all values present in database.
    readAllGuild(){
        const sql = `SELECT * FROM "${this.tableName}"`;
        const db = new sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        const listDB = db.prepare(sql).all();
        db.close();
        return listDB;
    }

    // Deletes the table.
    deleteAllGuild(){
        // Drop the indexing table if it exists.
        let sql = `DROP INDEX IF EXISTS "Index of ${this.tableName}"`;
        const db = new sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        db.prepare(sql).run();
        // Drop the entire table.
        sql = `DROP TABLE IF EXISTS "${this.tableName}"`;
        db.prepare(sql).run();
        db.close();
        delete this;
    }
}