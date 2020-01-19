const Sqlite3 = require('better-sqlite3');
const fs = require('fs');

module.exports = class Guild_Settings_Table{
    /*
        This constructor does the following:
        - Create data folder directory if not exists.
        - Create table if table does not exist.
        - Takes control of the table of given table name.
        - (OPTIONAL) Prints human readable debug logs.
    */
    constructor(table_name, debug){
        this.debug = debug;
        this.table_name = table_name;
        const dir = "./data";

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            if(this.debug) console.log("Creating data directory for database.");
        }

        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null});

        let sql = "CREATE TABLE IF NOT EXISTS " ;
        sql += this.table_name + "(";
        sql += "guild_id TEXT UNIQUE NOT NULL, ";
        sql += "mod_channel TEXT, ";
        sql += "admin_channel TEXT)";

        db.prepare(sql).run();
        db.close();

        if(this.debug) console.log("Table found/created.");
    }

    // Adds a list of guilds to the database.
    createGuild(list_guild){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        let sql = "INSERT INTO "; 
        sql += this.table_name;
        sql += "(guild_id) VALUES(?)";

        const statement = db.prepare(sql);

        list_guild.forEach(guild => {
            statement.run(guild);
            if(this.debug) console.log("Successfully added guild: " + guild + " to database.");
        });

        db.close();
    }

    // Read and return any ID present. The channel must be either "MOD" or "ADMIN", otherwise returns guild_id.
    readGuild(guild, channel){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        let sql = "SELECT *";
        sql += " FROM " + this.table_name;
        sql += " WHERE guild_id = ?";

        const info = db.prepare(sql).get(guild);

        db.close();

        if(this.debug) console.log("Obtained info from database with guild_id: " + info.guild_id);

        if(!info) return null;
        
        switch(channel){
            case "MOD":
                return info.mod_channel;
            case "ADMIN":
                return info.admin_channel;
            default:
                return info.guild_id;
        }
    }

    // Return all values present in database.
    readAllGuild(){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });

        const sql = "SELECT * FROM " + this.table_name;

        let list_db_guilds = db.prepare(sql).all();
        db.close();

        return list_db_guilds;
    }

    // Update any channel ID present. The channel must be either "MOD" or "ADMIN"
    updateGuild(guild, info, channel){
        
        if(channel === "MOD" || channel === "ADMIN"){
            let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
            let sql = "UPDATE " + this.table_name +" SET ";

            switch(channel){
                case "MOD":
                    var channel_type = "mod_channel";
                    break;
                case "ADMIN":
                    var channel_type = "admin_channel";
                    break;
            }
            sql += channel_type + " = ? WHERE guild_id = ?";

            db.prepare(sql).run(info, guild);
            db.close();

            if(this.debug) {
                console.log("Updated " + channel_type + " to guild_id" + guild);
            }
        }else{
            return;
        }
    }

    // Deletes a list of guilds from the database.
    deleteGuild(list_guild){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        let sql = "DELETE FROM ";
        sql += this.table_name;
        sql += " WHERE guild_id = ?";

        const statement = db.prepare(sql);

        list_guild.forEach(guild => {
            statement.run(guild);
            if(this.debug) console.log("Successfully removed guild: " + guild + " from database.");
        })

        db.close();
    }

    // Deletes the table.
    deleteAllGuild(){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });

        let sql = "DROP TABLE IF EXISTS " + this.table_name;

        db.prepare(sql).run();
        db.close();

        delete this;
    }
}
