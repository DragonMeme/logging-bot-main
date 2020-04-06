const { isModerator, isAdministrator } = require("../common/permissionCheck.js");

module.exports = {
    name: "kick",
    description: "Kicks a member from your server.",
    examples: ["kick 1234567890123456789", "kick @UserExample spamming ads"],
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
        switch(otherArguments.length){
            case 0: // No arguments supplied.
            return message.reply("You have not supplied a member of the guild for me to kick.");

            default: // One or more arguments supplied.
            // Remove "<", "@", "!" and ">" if a mention is used to get the snowflake.
            const obtainedUserID = /\d+/.exec(otherArguments[0]); 

            const userID = !obtainedUserID ? null : obtainedUserID[0];
            const memberToKick = message.guild.members.find(member => member.id === userID);
            if(!memberToKick) return message.reply("Sorry, I am unable to find that member in your guild!");
            else{
                if(memberToKick.id === message.client.user.id)
                    return message.reply("Sorry, I can not kick myself!");

                if(memberToKick.kickable){ // Ensure that the bot can kick the member.
                    if(isAdministrator(memberToKick)) // Bot will never kick administrators.
                        return message.reply("Sorry, I do not kick administrators of the server.");
                    if(isAdministrator(message.member)) // Administrators can kick moderators.
                        return kickMember(message, memberToKick, otherArguments.slice(1).join(" "));
                    if(isModerator(memberToKick)) // Ensure member does not meet moderator criteria.
                        return message.reply("Sorry, only administrators can allow me to kick moderators!");
                    return kickMember(message, memberToKick, otherArguments.slice(1).join(" "));
                }
                // Other reasons bot can't kick user.
                return message.reply("Sorry, I am unable to kick that user!"); 
            }
        }
    }
}

function kickMember(message, member, reason){
    return message.channel.send(`<@${member.id}> has been kicked!`).then(() => {
        member.kick(reason); // Will add later for logging.
    });
}