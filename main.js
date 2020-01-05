const Discord = require("discord.js");

const client = new Discord.Client();
var prefix = ",";

client.on('ready', () => {
    console.log('Logged in as ' + client.user.tag + '!');
    client.user.setStatus('available');
});

client.on('message', msg => {
    // Do not reply to any bot so avoid spam.
    if(msg.author.bot) return;

    // Check that the right prefix is used.
    if(!msg.content.startsWith(prefix)) return;

    let list_variables = msg.content.toLowerCase().slice(prefix.length).split(' ');

    // Send a ping message.
    if(list_variables[0] === 'ping'){

        // Obtain time the user sent the message.
        timeSent = msg.createdTimestamp;
        msg.channel.send('Pong!').then(
            // Attempt to edit the message by adding the time.
            sent => {

                // Otain time stamp between user message and bot message.
                var timePing = sent.createdTimestamp;
                var ping = timePing - timeSent;
                ping = String(ping);

                // Add ping message.
                sent.edit('Pong! `' + ping + 'ms`');
            }
        );
        
    }
});


client.login(BOT_TOKEN);
