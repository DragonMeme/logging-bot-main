const Assert = require("assert");
const Sqlite3 = require("better-sqlite3");
const Guild_Setting = require('./class/guild_settings_table.js');

describe("Guild Setting Table Functionality", function(){
    var g_test;

    // Make a new table with added dummy values.
    beforeEach(function(){
        // Make a table without affecting the server_settings information.
        g_test = new Guild_Setting("server_settings_test", false);

        let db = new Sqlite3("data/server.db", {"verbose": null });

        // In case the insert function does not work.
        let sql = "INSERT INTO server_settings_test(";
        sql += "guild_id, mod_channel, admin_channel) "
        sql += "VALUES(@guild_id, @mod_channel, @admin_channel)";

        let insert = db.prepare(sql);

        const insertMany = db.transaction((guilds) => {
            for (const guild of guilds) insert.run(guild);
        });
        
        insertMany([
            // Guild with no mod and admin channels set.
            {
                "guild_id": "GUILD_1",
                "mod_channel": null,
                "admin_channel": null
            },

            // Guild with no mod channel set.
            {
                "guild_id": "GUILD_2",
                "mod_channel": null,
                "admin_channel": "MAYBE"
            },

            // Guild with no admin channel set.
            {
                "guild_id": "GUILD_3",
                "mod_channel": "MAYBE",
                "admin_channel": null
            },

            // Guild with both mod and admin channels set.
            {
                "guild_id": "GUILD_4",
                "mod_channel": "MAYBE",
                "admin_channel": "MAYBE"
            }
        ]);

        db.close();
    });

    /*
        READ FUNCTIONALITY
        We must test the read functionality first as read ability 
        is needed to perform delete, insert and update tests.
        A call on the read functionality should be able to return
        the correct information based on second argument.
    */
    it("Testing READ GUILD_1's guild_id!", function(){
        var test = {
            "description" : "Reading GUILD_1 should return GUILD_1",
            "args" : "GUILD_1",
            "expected" : "GUILD_1"
        };

        Assert.equal(g_test.readGuild(test.args, null), test.expected, test.description);
    });

    it("Testing READ GUILD_3's mod_channel id which has a mod_channel id!", function(){
        var test = {
            "description" : "Reading GUILD_3's mod_channel should return 'MAYBE'.",
            "args" : "GUILD_3",
            "expected" : "MAYBE"
        };

        Assert.equal(g_test.readGuild(test.args, "MOD"), test.expected, test.description);
    });

    it("Testing READ GUILD_2's mod_channel id which has no mod_channel id!", function(){
        var test = {
            "description" : "Reading GUILD_2's mod_channel should return null.",
            "args" : "GUILD_2",
            "expected" : null
        };

        Assert.equal(g_test.readGuild(test.args, "MOD"), test.expected, test.description);
        
    });

    it("Testing READ GUILD_2's admin_channel id which has an admin_channel id!", function(){
        var test = {
            "description" : "Reading GUILD_2's admin_channel should return 'MAYBE'.",
            "args" : "GUILD_2",
            "expected" : "MAYBE"
        };

        Assert.equal(g_test.readGuild(test.args, "ADMIN"), test.expected, test.description);
    });

    it("Testing READ GUILD_3's admin_channel id which has no admin_channel id!", function(){
        var test = {
            "description" : "Reading GUILD_3's admin_channel should return null.",
            "args" : "GUILD_3",
            "expected" : null
        };

        Assert.equal(g_test.readGuild(test.args, "ADMIN"), test.expected, test.description);
    });

    it("Testing READ all guilds with their information.", function(){
        var test = {
            "description" : "ReadAllGuild should return every single guild with their settings.",
            "expected" : [

                // Guild with no mod channel and no admin channel. Default insert.
                {
                    "guild_id": "GUILD_1",
                    "mod_channel": null,
                    "admin_channel": null
                },
    
                // Guild with no mod channel set.
                {
                    "guild_id": "GUILD_2",
                    "mod_channel": null,
                    "admin_channel": "MAYBE"
                },
    
                // Guild with no admin channel set.
                {
                    "guild_id": "GUILD_3",
                    "mod_channel": "MAYBE",
                    "admin_channel": null
                },
    
                // Guild with both mod and admin channels set.
                {
                    "guild_id": "GUILD_4",
                    "mod_channel": "MAYBE",
                    "admin_channel": "MAYBE"
                }
            ]
        };

        Assert.equal(g_test.readAllGuild().toString(), test.expected.toString(), test.description);
    });

    /*
        DELETE FUNCTIONALITY
        The delete functionality should be able to remove guilds from the database.
    */

    it("Testing DELETE GUILD_1 from the database.", function(){
        var test = {
            "description" : "Reading GUILD_1 should return null after being deleted.",
            "args" : ["GUILD_1"],
            "expected" : null
        };

        g_test.deleteGuild(test.args);

        Assert.equal(g_test.readGuild(test.args, null), test.expected, test.description);
    });

    it("Testing DELETE GUILD_1 and GUILD_2 from the database.", function(){
        var test = {
            "description" : "Reading GUILD_1 and GUILD_2 should both be able to return null.",
            "args" : ["GUILD_1", "GUILD_2"],
            "expected" : [null, null]
        };

        g_test.deleteGuild(test.args);
        result = [g_test.readGuild(test.args[0], null), g_test.readGuild(test.args[1], null)];

        Assert.equal(result.toString(), test.expected.toString(), test.description);
    });

    /*
        INSERT FUNCTIONALITY
        The insert functionality should be able to add only guild_id
        as bot that enters a guild would not have had any channels
        set up as default. The insert functionality is also able to 
        insert multiple guilds in one function by giving a list of 
        guild_ids.
    */

    it("Testing INSERT GUILD_5 in to the database.", function(){
        var test = {
            "description" : "Reading GUILD_5 should return GUILD_5 after insertion.",
            "args" : ["GUILD_5"],
            "expected" : "GUILD_5"
        };

        g_test.createGuild(test.args);

        Assert.equal(g_test.readGuild(test.args, null), test.expected, test.description);
    });

    it("Testing INSERT GUILD_5 and GUILD_6 in to the database.", function(){
        var test = {
            "description" : "Reading GUILD_5 and GUILD_6 should both be able to return their respective guild_ids.",
            "args" : ["GUILD_5", "GUILD_6"],
            "expected" : ["GUILD_5", "GUILD_6"]
        };

        g_test.createGuild(test.args);
        result = [g_test.readGuild(test.args[0], null), g_test.readGuild(test.args[1], null)];

        Assert.equal(result.toString(), test.expected.toString(), test.description);
    });

    /*
        UPDATE FUNCTIONALITY
    */

    it("Testing UPDATE GUILD_1's mod_channel to a value.", function(){
        var test = {
            "description" : "Reading GUILD_1's mod_channel should return 'MAYBE' after updating",
            "args" : ["GUILD_1", "MAYBE"],
            "expected" : "MAYBE"
        };

        g_test.updateGuild(test.args[0], test.args[1], "MOD");
        Assert.equal(g_test.readGuild(test.args[0], "MOD"), test.expected, test.description);
    });

    it("Testing UPDATE GUILD_4's mod_channel to null.", function(){
        var test = {
            "description" : "Reading GUILD_4's mod_channel should return null after updating",
            "args" : ["GUILD_4", null],
            "expected" : null
        };

        g_test.updateGuild(test.args[0], test.args[1], "MOD");
        Assert.equal(g_test.readGuild(test.args[0], "MOD"), test.expected, test.description);
    });

    it("Testing UPDATE GUILD_1's admin_channel to a value.", function(){
        var test = {
            "description" : "Reading GUILD_1's admin_channel should return 'MAYBE' after updating",
            "args" : ["GUILD_1", "MAYBE"],
            "expected" : "MAYBE"
        };

        g_test.updateGuild(test.args[0], test.args[1], "ADMIN");
        Assert.equal(g_test.readGuild(test.args[0], "ADMIN"), test.expected, test.description);
    });

    it("Testing UPDATE GUILD_4's admin_channel to null.", function(){
        var test = {
            "description" : "Reading GUILD_4's admin_channel should return null after updating",
            "args" : ["GUILD_4", null],
            "expected" : null
        };

        g_test.updateGuild(test.args[0], test.args[1], "ADMIN");
        Assert.equal(g_test.readGuild(test.args[0], "ADMIN"), test.expected, test.description);
    });

    // Delete g_test so that a fresh test table can be re-created as new.
    afterEach(function(){
        // This function should work as this deletes g_test module.
        g_test.deleteAllGuild();
    });
});