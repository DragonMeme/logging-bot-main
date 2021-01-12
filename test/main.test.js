const { equal } = require("assert");
const Guild_Setting = require("../src/table/guild_settings");
const sqlite3 = require("better-sqlite3");

describe("Guild Setting Table Tests", function(){
	let settingTable = new Guild_Setting("test_db");
	beforeEach(() => {
		const listItems = [
			["guild1", null, null],
			["guild2", "random", null],
			["guild3", null, "random"]
		];

		const sql = "INSERT INTO test_db(\"Guild ID\", UL, UJ) VALUES(?,?,?)";
		const db = new sqlite3("data/server.db");
		const statement = db.prepare(sql);
		const transaction = db.transaction(listItems => {
			for(const listItem of listItems)  statement.run(listItem);
		});
		transaction(listItems);
		db.close();
	});

	it("Read All Guild ID", () => {
		const guildList = settingTable.readGuilds().toString();
		const expectedGuildList = ["guild1", "guild2", "guild3"].toString();
		equal(guildList, expectedGuildList, `Expected: ${expectedGuildList}\nActual: ${guildList}`);
	});

	it("Update One Data", () => {
		settingTable.updateData([
			["guild1", "UL", "random"]
		]);
		const result = settingTable.readData("guild1", "UL");
		equal(result, "random", `Expected: ${result}\nActual: random`);
	});

	it("Update multiple Data", () => {
		settingTable.updateData([
			["guild1", "UL", "random"],
			["guild2", "UJ", "someone"]
		]);
		const result = [
			settingTable.readData("guild1", "UL"),
			settingTable.readData("guild2", "UJ")
		].toString();
		const expectedResult = ["random", "someone"].toString();
		equal(result, expectedResult, `Expected: ${expectedResult}\nActual: ${result}`);
	});

	afterEach(() => {
		settingTable.deleteDataBase();
		settingTable = new Guild_Setting("test_db");
	});
});
