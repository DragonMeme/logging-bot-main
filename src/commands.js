exports.processCommand = function(msg, prefix, client){
    let list_variables = msg.content.toLowerCase().slice(prefix.length).split(' ');

    if(String(msg.author.id) === process.env.AUTHOR_ID){
        // These commands only apply to bot author
        switch(list_variables[0]){
            case "shutdown":
                shutdown(msg, client);
                break;
            default:
                break;
        }
    }
    
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
        console.log("Shutting down!");
        client.destroy();
    });
}
