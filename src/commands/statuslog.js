const { SettingTypesIndexes, StatusHeaders, SettingValues } = require("../common/guild_setting.json");

module.exports = {
    name: "statuslog",
    description: "Prints which channel the specific activities are being logged to.",
    examples: ["statuslog", "statuslog user"],
    permissionLevel: 2,
    parameters: {
        category: {
            requirement: "OPTIONAL",
            description: `Choose the category of which logging types to show. Possible values include:\n\
                - \`${Object.keys(SettingTypesIndexes).join("`\n- `")}\`\n\
                Note that if no argument is supplied, \`all\` is used by default.`
        }
    },
    execute(message, otherArguments){
        if(message.channel.type != "text") return;
        switch(otherArguments.length){
            case 0: // No other arguments needed.
            message.channel.send(printStatusLog(SettingTypesIndexes.all.max, SettingTypesIndexes.all.min));
            break;

            case 1:
            if(Object.keys(SettingTypesIndexes).includes(otherArguments[0])){
                const max = SettingTypesIndexes[otherArguments[0]].max;
                const min = SettingTypesIndexes[otherArguments[0]].min;
                const messageString = printStatusLog(max, min);
                message.channel.send(messageString);
            }else message.channel.send(`Invalid logging category \`${otherArguments[0]}\`!`);
            break;

            default:
            message.channel.send("Too many arguments supplied.");
            break;
        }
    }
}

const printStatusLog = (max, min) => {
    let messageString = "Current channels for logging of specific activity:";
    for(let i = min; i < max; i++){
        if(Object.keys(StatusHeaders).includes(String(i))) 
            messageString += `\n__**${StatusHeaders[String(i)]}:**__\n`;
        const currentValue = Object.values(SettingValues)[i];
        const result = null; // TODO: Get data from database.
        messageString += `${currentValue}: ${result == null ? "Not Set!" : `<#${result}>`}\n`;
    }
    return messageString;
}