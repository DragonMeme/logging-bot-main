# Contributing


## Coding Practice
In order to contribute to this project, you must follow a set of rules in the format of coding in which a few are listed below:

1.) When coding it is important to use ESLint.
This is available in IDEs such as Visual Studio Code. The linter will help you with the coding practice you must follow (not all) yet but worthy of mentioning them here as they may not be detected by the linter.
Check out the `.eslintrc` file to check for more information about the rules of coding practice.

2.) If you want to declare variables in a `case statement`, you have to perform an allman notation of adding curly brackets.
```js
switch(argument[0]){
  case 0: // Wanted
  { 
    const helpMessage = "You did not supply any arguments.";
    channel.send(helpMessage);
    break;
  }

  case 1:{ // Not wanted
    const helpMessage = `${help.name} - ${help.description}`;
    channel.send(helpMessage);
    break;
  }

  default: // A default case is always required.
}
```

3.) Adding strings is not necessary unless they are too long.
```js
// Not wanted, this can be replicated in template literals like in string2.
const string1 = "Hello this is " + name + ".";

// Wanted if adding a variable to change the string as needed.
const string2 = `Hello this is ${name}.`;

// This is okay as the string was too long.
const string3 = `This sentence "The big brown fox jumps over the lazy ${animal}." `
    + "Actually contains all the 26 characters of the English alphabet!";
```

4.) Conditional statements that are very long, the body of the statement can be added in the next line. If possible attempt to seperate the conditional statement.
```js
// Wanted: Short if statement so can be in one line.
if(animal === "dog") animal.bark();

// Curly brackets not needed unless there is 2 or more lines of code.
if(animal === "dog") {animal.bark()}

// Good way to handle a long conditional if statement.
if(message.guild.cache.get(guildID).channels.cache.get(channelID).type === "text")
    console.log("This is indeed a text channel.");

// Another good way to handle the if statement. This allows more debugging.
const targetGuild = message.guild.cache.get(guildID);
if(targetGuild){
  if(targetGuild.channels.cache.get(channelID)) 
    console.log("This is indeed a text channel.");
  else console.log("The guild exists but the channel does not!");
}else console.log("Guild does not exist");
```