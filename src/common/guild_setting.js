// The contents of setting.json should not change while the program is running.
const jsonData = require('./guild_setting.json');

// For reading activity types.
const jsonKeysSettingValues = Object.keys(jsonData["Setting Values"]);
const jsonValuesSettingValues = Object.values(jsonData["Setting Values"]);

// For reading activity categories
const jsonKeysSettingTypes = Object.keys(jsonData["Setting Types"]);

/*
    Export the requested value based on given key.
*/

// Check that the settings exist, otherwise return guild id by default.
exports.selectSettings = function(setting){
    return jsonKeysSettingValues.includes(setting) ? 
        jsonData["Setting Values"][setting] : jsonData["Default Setting Value"];
}

// Check that the category exists, return null if non existent.
exports.selectCategory = function(category){
    return jsonKeysSettingTypes.includes(category) ? jsonData["Setting Types"][category] : null;
}

exports.grabAllHeaderValues = function(){
    let arr = [];
    for(let s in jsonKeysSettingTypes){
        arr.push(jsonData["Setting Types"][s]["min"]);
    }
    return arr;
}

/*
    Export possible values.
*/

// For fetching headers for statuslog
exports.listHeadersForStatusLog = jsonData["Status Headers"];

// Export Setting Values Parameters.
exports.listKeysSettingValues = jsonKeysSettingValues;
exports.listValuesSettingValues = jsonValuesSettingValues;
exports.listKeysSettingTypes = jsonKeysSettingTypes;
