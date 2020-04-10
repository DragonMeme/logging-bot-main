const sqlite3 = require("better-sqlite3");
const { DefaultSettingValue, SettingValues } = require("../common/guild_setting.json");
const { existsSync, mkdirSync } = require("fs");

module.exports = class Guild_Setting{
	constructor(tableName){
		this.tableName = tableName;
		if (!existsSync("./data")) mkdirSync("./data");
		const settingValuesFormat = Object.values(SettingValues).join("\" TEXT, \"");
		let sql = `CREATE TABLE IF NOT EXISTS "${tableName}"("`;
		sql += `${DefaultSettingValue}" TEXT UNIQUE NOT NULL, "${settingValuesFormat}" TEXT)`;
		const db = new sqlite3("data/server.db", {"verbose": null});
		db.prepare(sql).run();
		db.close();
	}

	// POST: Creates a row entry instantiated with Guild ID.
	createData(listGuildID){
		const sql = `INSERT INTO "${this.tableName}"("${DefaultSettingValue}") VALUES(?)`;
		const db = new sqlite3("data/server.db", {"verbose": null });
		const statement = db.prepare(sql);
		listGuildID.forEach(guildID => statement.run(guildID));
		db.close();
	}

	// DELETE: Deletes the entire table.
	deleteDataBase(){
		const sql = `DROP TABLE IF EXISTS "${this.tableName}"`;
		const db = new sqlite3("data/server.db", {"verbose": null });
		db.prepare(sql).run();
		db.close();
		delete this;
	}

	// DELETE: Deletes a row entry.
	deleteData(listGuildID){
		const sql = `DELETE FROM "${this.tableName}" WHERE "${DefaultSettingValue}" = ?`;
		const db = new sqlite3("data/server.db", {"verbose": null });
		const statement = db.prepare(sql);
		listGuildID.forEach(guildID => statement.run(guildID));
		db.close();
	}

	// GET: Returns the whole table in JSON format.
	readDataBase(){
		const sql = `SELECT * FROM "${this.tableName}"`;
		const db = new sqlite3("data/server.db", {"verbose": null });
		const listDB = db.prepare(sql).all();
		db.close();
		return listDB;
	}

	// GET: Returns the entire row given the Guild ID exists.
	readDataRow(guildID){
		const sql = `SELECT * FROM "${this.tableName}" WHERE "${DefaultSettingValue}" = ?`;
		const db = new sqlite3("data/server.db", {"verbose": null });
		const info = db.prepare(sql).get(guildID);
		db.close();
		return info;
	}

	// GET: Returns a row entry given the Guild ID exists.
	readData(guildID, category){
		const categoryExists = Object.keys(SettingValues).includes(category);
		const option = categoryExists ? SettingValues[category] : DefaultSettingValue;
		const sql = `SELECT "${option}" FROM "${this.tableName}" WHERE "${DefaultSettingValue}" = ?`;
		const db = new sqlite3("data/server.db", {"verbose": null });
		const info = db.prepare(sql).get(guildID);
		db.close();
		return info ? info[option] : null;
	}

	// PUT: Modify data on a row given appropriate category.
	updateData(guildID, category, data){
		const categoryExists = Object.keys(SettingValues).includes(category);
		if(!categoryExists) return; // Do not go further if not setting a setting value.
		const option = SettingValues[category];
		const sql = `UPDATE "${this.tableName}" SET "${option}" = ? WHERE "${DefaultSettingValue}" = ?`;
		const db = new sqlite3("data/server.db", {"verbose": null });
		db.prepare(sql).run(data, guildID);
		db.close();
	}
};
