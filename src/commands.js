exports.processCommand = function(msg, prefix, client){
    let list_variables = msg.content.toLowerCase().slice(prefix.length).split(' ');

    if(msg.author.id === process.env.AUTHOR_ID){
        // These commands only apply to bot author
        switch(list_variables[0]){
            case "shutdown":
                shutdown(msg, client);
                break;
            default:
                break;
        }
    }

    if(msg.author)
    
    //Any user can use these commands.
    switch(list_variables[0]){
        case "ping":
            ping(msg);
            break;
        default:
            break;
    }
    
};

/*
    COMMANDS EVERYONE CAN USE
*/
function ping(msg){
    // Obtain time the user sent the message.
    var timeSent = msg.createdTimestamp;
    msg.channel.send('Pong!').then(
        // Attempt to edit the message by adding the time.
        sent => {

            // Otain time stamp between user message and bot message.
            var timePing = sent.createdTimestamp;
            var ping = timePing - timeSent;

            // Add ping message.
            sent.edit('Pong! `' + String(ping) + 'ms`');
        }
    );
}

function shutdown(msg, client){
    // Send a message before shutting down.
    msg.channel.send("Shutting down!").then(() => {
        console.log("\nShutting down!");
        client.destroy();
    });
}

function makeTimer(duration){
    // Obtain the number, return if not a number.
    let number = Number(duration.slice(0, duration.length - 1));
    if(number === NaN) return null;
    
    let time_index = duration.slice(duration.length - 1);
    
    switch(time_index){
        // Seconds.
        case 's':
            time_muted = Date.now() + (number * 1000);
            break;
    
        // Minutes.
        case 'm':
            time_muted = Date.now() + (number * 60000);
            break;
    
        // Hours.
        case 'h':
            time_muted = Date.now() + (number * 3600000);
            break;
    
        // Days.
        case 'd':
            time_muted = Date.now() + (number * 86400000);
            break;
        default:
            return null;
    }
    return time_muted;
}

/*
    HELPER FUNCTIONS
*/
function checkModPermissions(msg){
    let member = msg.guild.members.find(msg.author.id);
    let permissionLevel = 0;

    // First check for moderator permissions.
    // A moderator should have at least 3 of the permissions.
    if(member.hasPermission(0x2)) permissionLevel++; // Kick Member
    if(member.hasPermission(0x4)) permissionLevel++; // Ban Member
    if(member.hasPermission(0x2000)) permissionLevel++; // Manage Messages
    if(member.hasPermission(0x8000000)) permissionLevel++; // Manage Nicknames

    return permissionLevel;
}

function checkAdminPermissions(msg){
    let member = msg.guild.members.find(msg.author.id);
    let permissionLevel = 0;

    // First check for moderator permissions.
    // An admin should have at least 3 of the permissions.
    if(member.hasPermission(0x8)) permissionLevel++; // Administrator (not required)
    if(member.hasPermission(0x10)) permissionLevel++; // Manage Channels
    if(member.hasPermission(0x20)) permissionLevel++; // Manage Guild
    if(member.hasPermission(0x10000000)) permissionLevel++; // Manage Nicknames

    return permissionLevel;
}
