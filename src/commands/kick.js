const { isModerator, isAdministrator } = require("../common/permissionCheck.js");

module.exports = {
    name: "kick",
    description: "Kicks a member from your server.",
    examples: ["kick 1234567890123456789", "kick @UserExample Spamming ads"],
    permissionLevel: 1,
    parameters: {
        member: {
            requirement: true,
            description: "The member to kick out of the server given the member is in the guild. " + 
            "This argument must be the ID of the user or a user mention."
        },
        reason: {
            requirement: false,
            description: "The reason for the kick. The reason is not required to be put in double " + 
            "quotation marks and can have more than 1 word."
        }
    },
    execute(message, otherArguments){
        if(message.guild.me.hasPermission("KICK_MEMBERS")){ // Ensure the bot has permission to kick.
            // Remove "<", "@", "!" and ">" if a mention is used to get the snowflake.
            const obtainedUserID = /\d+/.exec(otherArguments[0]); 

            // Obtain member to kick.
            const memberToKick = message.guild.members.find(member => member.id === obtainedUserID[0]);
            switch(otherArguments.length){
                case 0: // No arguments supplied.
                return message.reply("You have not supplied a member of the guild for me to kick.");

                case 1: // Only the user is supplied.
                if(!memberToKick) return message.reply("Sorry, I am unable to find that member in your guild!");
                else return kickMember(message, memberToKick, null);

                default: // A reason is supplied as well as the user.
                const reason = otherArguments.slice(1).join(" ");
                if(!memberToKick) return message.reply("Sorry, I am unable to find that member in your guild!");
                else return kickMember(message, memberToKick, reason);
            }
        }else return message.reply("Missing permission `KICK MEMBERS`");
    }
}

function kickMember(message, member, reason){
    if(member.id === message.client.user.id)
        return message.reply("Sorry, I can not kick myself!");

    if(member.kickable){ // Ensure that the bot can kick the member.
        if(isAdministrator(member)) // Bot will never kick administrators.
            return message.reply("Sorry, I do not kick administrators of the server.");
        if(isAdministrator(message.member)) // Administrators can kick moderators.
            return message.channel.send(`<@${member.id}> has been kicked!`).then(() => {
                member.kick(reason); // Will add later for logging.
            });
        if(isModerator(member)) // Ensure member does not meet moderator criteria.
            return message.reply("Sorry, only administrators can allow me to kick moderators!");
        return message.channel.send(`<@${member.id}> has been kicked!`).then(() => {
            member.kick(reason); // Will add later for logging.
        });
    }
    // Other reasons bot can't kick user.
    return message.reply("Sorry, I am unable to kick that user!"); 
}