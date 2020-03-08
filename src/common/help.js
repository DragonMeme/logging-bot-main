// The contents of help.json should not change while the program is running.
const jsonData = require("./help.json");
const jsonQuickSetLog = require("./quicksetlog.json");
const guildSetting = require("./guild_setting.js");
const jsonValuesHelpArguments = Object.keys(jsonData);
const jsonQuickSetLogKeys = Object.keys(jsonQuickSetLog);

exports.getParameter = function(argument, parameter){
    if(!jsonData[argument][parameter]){
        return null;
    }else{
        let constructActivityDescription = jsonData[argument][parameter];
        if(argument === "quicksetlog"){ // Special case for quicksetlog.
            if(parameter === "<option>"){
                jsonQuickSetLogKeys.forEach(
                    key => {
                        constructActivityDescription += `\n- \`${key}\` = ${jsonQuickSetLog[key]}`;
                    }
                )
            }
        }else if(argument === "setlog"){ // Special case of setlog.
            if(parameter === "<activity>"){ 
                let settingValueResults = [];
                guildSetting.listValuesSettingValues.forEach(
                    settingValue => {
                        let settingValueResult = settingValue.toLowerCase();
                        if(settingValueResult.endsWith("role")){ 
                            return; //skip role as is not an activity type.
                        }
                        if(settingValueResult.endsWith("s")){
                            settingValueResult = settingValueResult.slice(0,settingValue.length - 1);
                        }
                        let settingWords = settingValueResult.split(" ");
                        if(settingWords.length > 2){
                            if(settingWords[0] === "user"){
                                settingWords.shift();
                            }
                            if(settingValueResult.startsWith("voice chat")){ // Replace "voice chat" with "vc".
                                settingWords.shift();
                                settingWords[0] = "vc";
                            }
                        }
                        settingValueResults.push(settingWords.join("_"));
                    }
                )
                settingValueResults.sort();
                settingValueResults.forEach(
                    settingValueResult => {
                        constructActivityDescription += `\n- \`${settingValueResult}\``;
                    }
                )
            }
        }
        return constructActivityDescription;
    }
}

exports.getMainDescription = function(prefix){
    return "Arguments closed with `[]` are optional.\n" + 
    "Arguments closed with `<>` are required.\n" + 
    `Do not add \`[]\` and \`<>\` to your arguments (e.g. \`${prefix}setlog user_deletes on\`).`;
}

exports.helpArguments = jsonValuesHelpArguments;