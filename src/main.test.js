const Assert = require("assert");
const Sqlite3 = require("better-sqlite3");
const Guild_Setting = require('./class/guild_settings_table.js');
const Muted_Setting = require('./class/muted_people_table.js');

describe("Muted People Functionality", function(){
    var g_test_1, g_test_2;
    
    // Make a new table with added dummy values.
    beforeEach(function(){
        // Make a table without affecting the server_settings information.
        g_test_1 = new Guild_Setting("server_settings_test", false);
        g_test_2 = new Muted_Setting("server_settings_test", "muted_people_test", false);

        g_test_1.createGuild(["GUILD_1", "GUILD_2", "GUILD_3"]);

        g_test_1.updateGuild("GUILD_1", "MUTED", "MR");
        g_test_1.updateGuild("GUILD_2", "MUTED", "MR");

        let sql = "INSERT INTO muted_people_test(";
        sql += "guild_id, player_id, muted_until) "
        sql += "VALUES(@guild_id, @player_id, @muted_until)";

        let db = new Sqlite3("data/server.db");

        let insert2 = db.prepare(sql);

        const insertMany2 = db.transaction((guilds) => {
            for (const guild of guilds) insert2.run(guild);
        });

        /*
            PLAYER 1 is muted in 2 guilds.
            PLAYER 2 and PLAYER_3 is muted in one guild.
        */
        insertMany2([
            {
                "guild_id": "GUILD_1",
                "player_id": "PLAYER_1",
                "muted_until": 25
            },
            {
                "guild_id": "GUILD_1",
                "player_id": "PLAYER_2",
                "muted_until": 30
            },
            {
                "guild_id": "GUILD_2",
                "player_id": "PLAYER_1",
                "muted_until": 35
            },
            {
                "guild_id": "GUILD_2",
                "player_id": "PLAYER_3",
                "muted_until": 40
            }
        ]);

        db.close();
    });

    // Delete g_tests so that a fresh test table can be re-created as new.
    afterEach(function(){
        // This function should work as this deletes g_test module.
        g_test_1.deleteAllGuild();
        g_test_2.deleteAllGuild();
    });

    it("Testing SELECT of all of PLAYER_1's mutes.", () => {
        var test = {
            "description" : "Reading PLAYER_1's list should return 2 results with the same player_id.",
            "args" : "PLAYER_1",
            "expected" : [
                {
                    "guild_id": "GUILD_1",
                    "player_id": "PLAYER_1",
                    "muted_until": 25
                },
                {
                    "guild_id": "GUILD_2",
                    "player_id": "PLAYER_1",
                    "muted_until": 35
                }
            ]
        };

        Assert.equal(g_test_2.selectMutedPersonList(test.args).toString(), 
        test.expected.toString(), test.description);
    });

    it("Testing SELECT of GUILD_1's player mutes.", () => {
        var test = {
            "description" : "Reading GUILD_1's list should return 2 results with the same guild_id.",
            "args" : "GUILD_1",
            "expected" : [
                {
                    "guild_id": "GUILD_1",
                    "player_id": "PLAYER_1",
                    "muted_until": 25
                },
                {
                    "guild_id": "GUILD_1",
                    "player_id": "PLAYER_2",
                    "muted_until": 30
                }
            ]
        };

        Assert.equal(g_test_2.selectListMutedPeople(test.args).toString(), 
            test.expected.toString(), test.description);
    });

    it("Testing REPLACE of GUILD_1's player mute.", () => {
        var test = {
            "description" : "Reading GUILD_1's list should return 1 results with the updated muted time.",
            "args" : "GUILD_1",
            "expected" : [
                {
                    "guild_id": "GUILD_1",
                    "player_id": "PLAYER_1",
                    "muted_until": 45
                },
                {
                    "guild_id": "GUILD_1",
                    "player_id": "PLAYER_2",
                    "muted_until": 30
                }
            ]
        };

        // Should update PLAYER_1's status on GUILD_1 instead of adding another.
        g_test_2.insertOrReplaceMutedTimer(test.expected[0].guild_id, 
            test.expected[0].player_id, 45);

        Assert.equal(g_test_2.selectListMutedPeople(test.args).toString(), 
            test.expected.toString(), test.description);
    });

});
