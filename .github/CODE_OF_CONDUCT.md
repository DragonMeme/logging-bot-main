# Code of Conduct
In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Standards
Examples of behavior that contributes to creating a positive environment include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a professional setting


## Coding Practice
In order to contribute to this project, you must follow a set of rules in the format of coding which are below:

1.) No excessive use of AND statements (`&&` and/or `&`) especially combined to one condition, use nested if statements instead for this.
Example:
```js
// Wanted as given statement is short enough.
if(a && b) func1();
else func2();

// Not Wanted as condition statement is too long.
if(message.guild.channels.cache.filter(mchannel => channel.id === targetChannelID) && message.author.id === process.env.AUTHORID) func1();
else func2();

/*
  Example we want to run functions upon the given statements:
  a && b: run func1()
  a && c: run runc2()
*/

// Wanted (Checking for a is common so a should be checked only once)
if(a){
  if(b) func1();
  else if(c) func2();
}

// Not Wanted (Nicer but a is being checked at most twice)
if(a & b) func1();
else if(a & c) func2();
```
Reason: Putting multiple conditions in an if statement makes the overall condition harder for user to analyse. By using nested if statements, the condition flow makes the overall required condition easier to follow.


2.) Any string that has a variable component has to be closed with backticks while the strings without backticks to be closed with double quotation marks.
```js
func1(){
  // Wanted (double quotes)
  const missing = "fox";

  // Wanted (using backticks if you want to add a variable to a string constructor)
  const fullText = `This is a ${missing}.`;
}

func2(){
  // Not Wanted (single quotes)
  const missing = 'fox';
  
  // Not Wanted (Adding string with a variable)
  const fullText = "This is a " + missing + ".";
}

func3(){
  const missing = "dog";
  
  // However this is okay as the full text string is too long thus have to be split.
  const fullText = `This sentence "The big brown fox junps over the lazy ${missing}" ` +
    "actually uses all 26 letters of the full English alphabet";
}

```
Reason: Strings closed with backticks has a nice feature that allows putting a variable in the string. Double quotation marks makes reading a static string easier to differentiate between strings that use backticks as compared to using single quotation marks.

3.) Only code that has the required intended functionality completed may be pushed in to the intended repository.

Users may only push working code to a non-default branch. Changes of code to the master branch should only happen when the requested branch has the optimized and working code and ready to be merged in to master.

4.) Variable Naming convention.

Anywhere in the code, variables must have their names without an underscore.
```js
/*
  Supposedly read() function reads the database.
  We want to assign the resultant to a variable.
*/

// Wanted (replace space with a starting capital letter of the 2nd word and so forth)
readDatabase = read(input);

// Acceptable (known shortcuts can be in all capitals)
readDB = read(input);

// Not Wanted (has underscore)
read_Database = read(input);

// Not Wanted (reduces readability)
readdatabase = read(input);
```
