const Guild_Setting = require("./table/guild_settings.js");
const { DefaultSettingValue } = require("./common/guild_setting.json");

const author = process.env.AUTHOR_ID;
const guildSettingTable = new Guild_Setting("Server Settings");

exports.initialise = function(client){
    const listGuildID = [];
    /*
        Search the guilds that the bot currently is in.
        The bot will automatically leave any server that does not meet the requisites.
        As for the guilds that meet the requisites, the id is added to listGuildID.
    */
   console.log("=> Looking for missing servers to add to database.");
    client.guilds.forEach(
        guild => {
            const guildID = guild.id;
            if(guild.members.filter(member => !member.user.bot).size < 50){
                if(guild.ownerID == author) listGuildID.push(guildID); 
                else guild.leave();
            }else listGuildID.push(guildID);
        }
    );
    console.log("All guilds that the bot is in have been searched and has left any servers that does not meet requisites!\n");
    
    /*
        Check the database and see whether the entry from listGuildID exists or not.
        Add missing GuildID to database if needed.
    */
   console.log("=> Attempting to add missing guilds to the database.");
    listGuildID.forEach(guild => {
        if(guildSettingTable.readData(guild, "G") == null){
            guildSettingTable.createData([guild]);
            console.log(`${DefaultSettingValue}: ${guild} was not in database. It is now added!`);
        }
    });
    console.log("New servers successfully added to database.\n");

    /*
        Prune any guild in the database that the the bot is no longer part of.
        This is used to save space.
    */
    console.log("=> Removing any server that the bot is currently not in.");
    guildSettingTable.readDataBase().forEach(guild => {
        let guildID  = guild[`${DefaultSettingValue}`];
        if(!listGuildID.includes(guildID)) {
            guildSettingTable.deleteData([guildID]);
            console.log(`${DefaultSettingValue}: ${guildID} is now removed from the database.`);
        }
    });
    console.log("Guilds have been successfully pruned!\n");
};

/*
    CRUD Commands.
*/
exports.createData = function(listGuild){
    guildSettingTable.createData(listGuild);
};
exports.readData = function(guild, setting){
    return guildSettingTable.readData(guild, setting);
};
exports.updateData = function(guild, setting, data){
    guildSettingTable.updateData(guild, setting, data);
};
exports.deleteData = function(listGuild){
    guildSettingTable.deleteData(listGuild);
};
