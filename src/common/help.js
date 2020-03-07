// The contents of help.json should not change while the program is running.
const jsonData = require('./help.json');
const jsonValuesHelpArguments = Object.keys(jsonData);

exports.getUsage = function(arg){
    return !jsonData[arg]["Usage"] ? null : jsonData[arg]["Usage"];
}
exports.getShortDescription = function(arg){
    return !jsonData[arg]["Short Description"] ? null : jsonData[arg]["Short Description"];
}

exports.getMainDescription = function(prefix){
    return "Arguments closed with `[]` are optional.\n" + 
    "Arguments closed with `<>` are required.\n" + 
    `Do not add \`[]\` and \`<>\` to your arguments (e.g. \`${prefix}setlog user_deletes on\`).`;
}

exports.helpArguments = jsonValuesHelpArguments;