// The contents of setting.json should not change while the program is running.
const jsonData = require('./guild_setting.json');
const jsonKeys = Object.keys(jsonData["Setting Values"]);
const jsonValues = Object.values(jsonData["Setting Values"]);

// Check that the settings exist, otherwise return guild_id by default.
exports.select_settings = function(setting){
    return jsonKeys.includes(setting) ? jsonData["Setting Values"][setting] : jsonData["Default Setting Value"];
}

exports.list_keys = jsonKeys;
exports.list_values = jsonValues;