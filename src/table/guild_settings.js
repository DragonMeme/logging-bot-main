const sqlite3 = require("better-sqlite3")("data/server.db");
const { DefaultSettingValue, SettingValues } = require("../common/guild_setting.json");
const { existsSync, mkdirSync } = require("fs");
const availableCategory = Object.keys(SettingValues);

module.exports = class Guild_Setting{
	constructor(tableName){
		this.tableName = tableName;
		if (!existsSync("./data")) mkdirSync("./data");
		const settingValuesFormat = availableCategory.join("\" TEXT, \"");
		let sql = `CREATE TABLE IF NOT EXISTS "${tableName}"("`;
		sql += `${DefaultSettingValue}" TEXT UNIQUE NOT NULL, "${settingValuesFormat}" TEXT)`;
		sqlite3.prepare(sql).run();
	}

	// POST: Creates a row entry instantiated with Guild ID.
	createData(listGuildID){
		const sql = `INSERT INTO "${this.tableName}"("${DefaultSettingValue}") VALUES(?)`;
		const statement = sqlite3.prepare(sql);
		const transaction = sqlite3.transaction(guildIDs => {
			for(const guildID of guildIDs) statement.run(guildID);
		});
		transaction(listGuildID);
	}

	// DELETE: Deletes the entire table.
	deleteDataBase(){
		const sql = `DROP TABLE IF EXISTS "${this.tableName}"`;
		sqlite3.prepare(sql).run();
		delete this;
	}

	// DELETE: Deletes a row entry.
	deleteData(listGuildID){
		const sql = `DELETE FROM "${this.tableName}" WHERE "${DefaultSettingValue}" = ?`;
		const statement = sqlite3.prepare(sql);
		const transaction = sqlite3.transaction(guildIDs => {
			for(const guildID of guildIDs) statement.run(guildID);
		});
		transaction(listGuildID);
	}

	// GET: Returns the whole table in JSON format.
	readDataBase(){
		const sql = `SELECT * FROM "${this.tableName}"`;
		const listDB = sqlite3.prepare(sql).raw().all();
		return listDB;
	}

	// GET: Returns the entire row given the Guild ID exists.
	readDataRow(guildID){
		const sql = `SELECT * FROM "${this.tableName}" WHERE "${DefaultSettingValue}" = ?`;
		const info = sqlite3.prepare(sql).get(guildID);
		return info;
	}

	// GET: Returns a row entry given the Guild ID exists.
	readData(guildID, category){
		const categoryIndex = availableCategory.indexOf(category);
		const option = categoryIndex >= 0 ? category : DefaultSettingValue;
		const sql = `SELECT "${option}" FROM "${this.tableName}" WHERE "${DefaultSettingValue}" = ?`;
		const info = sqlite3.prepare(sql).raw().get(guildID);
		return info ? info[categoryIndex] : null;
	}

	// PUT: Modify data on a row given appropriate category.
	/*
		Each input data in the input array must be of form:
		[guildID, SettingValue, data (channel ID)]
	*/
	updateData(listData){
		if(listData.length === 1){
			const data = listData[0];
			const categoryExists = availableCategory.includes(data[1]);
			if(!categoryExists) return; // Do not go further if not setting a setting value.
			const sql = `UPDATE "${this.tableName}" SET "${data[1]}" = ${data[2]} WHERE ` +
				`"${DefaultSettingValue}" = ${data[0]}`;
			sqlite3.prepare(sql).run();
		}else{
			let SQLString = "BEGIN TRANSACTION;\n";
			listData.forEach(currentData => {
				const category = currentData[1];
				const categoryExists = availableCategory.includes(category);
				if(!categoryExists) return; // Do not go further if not setting a setting value.
				SQLString += `UPDATE "${this.tableName}" SET "${category}" = ${currentData[2]} WHERE ` +
					`"${DefaultSettingValue}" = ${currentData[0]};\n`;
			});
			SQLString += "COMMIT;";
			sqlite3.exec(SQLString);
		}
	}
};
