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

1.) No using of AND statements (`&&` and/or `&`), use nested if statements instead.

Example:
```js
// Not wanted
if(a && b){
  do func1();
}else{
  do func2();
}

// Wanted
if(a){
  if(b){
    do func1();
  }else{
    do func2();
  }
}else{
  do func2();
}
```
Reason: Putting multiple conditions in an if statement makes the overall condition harder for user to analyse. By using nested if statements, the condition flow makes the overall required condition easier to follow.


2.) Any string that has a variable component has to be closed with backticks while the strings without backticks to be closed with double quotation marks.
```js
func1(){
  // Wanted
  const missing = "fox";

  // Wanted 
  const full_text = `This is a ${missing}.`;
}

func2(){
  // Not Wanted 
  const missing = 'fox';
  
  // Not Wanted
  const full_text = "This is a " + missing + ".";
}

```
Reason: Strings closed with backticks has a nice feature that allows putting a variable in the string. Double quotation marks makes reading a static string easier to differentiate between strings that use backticks as compared to using single quotation marks.

3.) Only code that has the required intended functionality completed may be pushed in to the intended repository.

Users may only push working code to a non-default branch. Changes to master branch should only happen when the branch has optimized code and ready to be merged in to by another branch.
