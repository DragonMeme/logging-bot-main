module.exports = {
    consoleLogTime: function(message){
        const dateObject = new Date(Date.now());
        const year = dateObject.getFullYear();
        const month = numberString(2, dateObject.getMonth() + 1);
        const day = numberString(2, dateObject.getDate());
        const hour = numberString(2, dateObject.getHours());
        const minute = numberString(2, dateObject.getMinutes());
        const second = numberString(2, dateObject.getSeconds());
        const millisecond = numberString(3, dateObject.getMilliseconds());
        const date = `${year}/${month}/${day}`;
        const time = `${hour}:${minute}:${second}`;
        const dateTime = `${date} ${time}-${millisecond}`;
        if(message.startsWith("==> ")) return console.log(`${dateTime} ${message}`);
        else if(message.startsWith("=>  ")) return console.log(`${dateTime} ${message}`);
        return console.log(`${dateTime}     ${message}`);
    }
}

function numberString(length, number){
    let result = "";
    for(let i = length - 1; i >= 0; i--) result += Math.floor(((number / Math.pow(10, i)) % 10)).toFixed(0);
    return result;
}