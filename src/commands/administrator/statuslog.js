const Administrator_Command = require("../administrator_command.js");
const guildSetting = require("../../common/guild_setting.js");
const database = require("../../database.js");

require("dotenv").config();

module.exports = class statuslog extends Administrator_Command{
    constructor(message, argumentList){
        super(message, argumentList);
        this.guildID = message.guild.id;
        this.listKeysSettingValues = guildSetting.listKeysSettingValues;
        this.listValuesSettingValues = guildSetting.listValuesSettingValues;
        this.validOptions = guildSetting.listKeysSettingTypes;
    }

    execute(){
        if(!this.checkPermissionUser()) return;
        switch(this.otherArguments.length){
            case 0: 
            const maxMin = guildSetting.selectCategory(this.validOptions[0]);
            this.message.channel.send(this.printStatusLog(maxMin["max"], maxMin["min"]));
            break;

            case 1: 
            const currentOption = this.argumentList[1];
            if(this.validOptions.includes(currentOption)){ // Check that second argument is valid.
                const maxMin = guildSetting.selectCategory(currentOption);
                this.message.channel.send(this.printStatusLog(maxMin["max"], maxMin["min"]));
            }else{
                const messageString = `Invalid second argument \`${currentOption}\`.`;
                this.sendError(messageString);
            }
            break;

            default:
            this.sendSentTooManyArgumentsError();
            return;
        }
    }

    printStatusLog(maximum, minimum){
        const headers = guildSetting.listHeadersForStatusLog;
        let messageString = "Current channels for logging of specific activity:";
        for(let i = minimum; i < maximum; i++){
            if(Object.keys(headers).includes(String(i))) messageString += `\n__**${headers[String(i)]}:**__\n`;
            const currentValue = this.listValuesSettingValues[i];
            const result = database.readGuild(this.guildID, this.listKeysSettingValues[i]);
            messageString += `${currentValue}: ${result == null ? "Not Set!" : `<#${result}>`}\n`;
        }
        return messageString;
    }
}
