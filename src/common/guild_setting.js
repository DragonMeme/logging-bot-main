// The contents of guild_setting.json should not change while the program is running.
const jsonData = require("./guild_setting.json");
// For reading activity types.
const jsonKeysSettingValues = Object.keys(jsonData["SettingValues"]);
const jsonValuesSettingValues = Object.values(jsonData["SettingValues"]);
// For reading activity categories
const jsonKeysSettingTypes = Object.keys(jsonData["SettingTypesIndexes"]);

/*
    Export the requested value based on given key.
*/
// Check that the settings exist, otherwise return guild id by default.
exports.selectSettings = function(setting){
    return jsonKeysSettingValues.includes(setting) ? 
        jsonData["SettingValues"][setting] : jsonData["DefaultSettingValue"];
}
// Check that the category exists, return null if non existent.
exports.selectCategory = function(category){
    return jsonKeysSettingTypes.includes(category) ? jsonData["SettingTypesIndexes"][category] : null;
}
exports.grabAllHeaderValues = function(){
    let arr = [];
    for(let s in jsonKeysSettingTypes) arr.push(jsonData["SettingTypesIndexes"][s]["min"]);
    return arr;
}

/*
    Export possible values.
*/
// For fetching headers for statuslog
exports.listHeadersForStatusLog = jsonData["StatusHeaders"];
// Export Setting Values Parameters.
exports.listKeysSettingValues = jsonKeysSettingValues;
exports.listValuesSettingValues = jsonValuesSettingValues;
exports.listKeysSettingTypes = jsonKeysSettingTypes;
