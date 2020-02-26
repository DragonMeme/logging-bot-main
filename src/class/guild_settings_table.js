const Main_Table = require('./main_table');
const Sqlite3 = require('better-sqlite3');

/*
    The class stores rules as to which setting to post logs at.
*/
module.exports = class Guild_Settings_Table extends Main_Table{
    
    constructor(table_name, debug){
        super(table_name, debug);

        let sql = "CREATE TABLE IF NOT EXISTS " ;
        sql += this.table_name + "(";
        sql += "guild_id TEXT UNIQUE NOT NULL, ";

        // User activity.
        sql += "user_joins TEXT, ";
        sql += "user_leaves TEXT, ";
        sql += "user_msg_deletes TEXT, ";
        sql += "user_msg_edits TEXT, ";
        sql += "user_nick_changes TEXT, ";
        sql += "user_role_assigns TEXT, ";

        // Channel activity.
        sql += "bulk_delete TEXT, ";
        sql += "vc_joins TEXT, ";
        sql += "vc_leaves TEXT, ";

        // Moderator activity.
        sql += "user_kicked TEXT, ";
        sql += "user_muted TEXT, ";
        sql += "muted_role TEXT)";

        this.initTable(sql);
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

    /*
        Read and return any ID present. 
    */
    readGuild(guild, setting){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        let sql = "SELECT *";
        sql += " FROM " + this.table_name;
        sql += " WHERE guild_id = ?";

        const info = db.prepare(sql).get(guild);

        db.close();

        if(this.debug) console.log("Obtained info from database with guild_id: " + info.guild_id);

        if(!info) return null;
        
        switch(setting){
            case "UJ":
                return info.user_joins;

            case "UL":
                return info.user_leaves;

            case "UMD":
                return info.user_msg_deletes;

            case "UME":
                return info.user_msg_edits;

            case "UNC":
                return info.user_nick_changes;

            case "URA":
                return info.user_role_assigns;

            case "BD":
                return info.bulk_delete;

            case "VJ":
                return info.vc_joins;

            case "VL":
                return info.vc_leaves;

            case "UK":
                return info.user_kicked;

            case "UM":
                return info.user_muted;

            case "MR":
                return info.muted_role;

            default:
                return info.guild_id;
        }
    }

    updateGuild(guild, info, setting){
        let db = new Sqlite3("data/server.db", {"verbose": this.debug ? console.log : null });
        let sql = "UPDATE " + this.table_name +" SET ";
        var setting_type;

        switch(setting){
            case "UJ":
                setting_type = "user_joins";
                break;

            case "UL":
                setting_type = "user_leaves";
                break;

            case "UMD":
                setting_type = "user_msg_deletes";
                break;

            case "UME":
                setting_type = "user_msg_edits";
                break;

            case "UNC":
                setting_type = "user_nick_changes";
                break;

            case "URA":
                setting_type = "user_role_assigns";
                break;

            case "BD":
                setting_type = "bulk_delete";
                break;

            case "VJ":
                setting_type = "vc_joins";
                break;

            case "VL":
                setting_type = "vc_leaves";
                break;

            case "UK":
                setting_type = "user_kicked";
                break;

            case "UM":
                setting_type = "user_muted";
                break;

            case "MR":
                setting_type = "muted_role";
                break;

            default:
                return;
        }
        sql += setting_type + " = ? WHERE guild_id = ?";

        db.prepare(sql).run(info, guild);
        db.close();

        if(this.debug) {
            console.log("Updated " + setting_type + " to guild_id" + guild);
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
}
