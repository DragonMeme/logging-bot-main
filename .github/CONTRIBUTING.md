# Contributing


## Coding Practice
In order to contribute to this project, you must follow a set of rules in the format of coding in which a few are listed below:

1.) No using of AND statements (`&&` and/or `&`), use nested if statements instead.

Example:
```js
// Not wanted
if(a && b){
  func1();
}else{
  func2();
}

// Wanted
if(a){
  if(b){
    func1();
  }else{
    func2();
  }
}else{
  func2();
}
```
Reason: Putting multiple conditions in an if statement makes the overall condition harder for user to analyse. By using nested if statements, the condition flow makes the overall required condition easier to follow.


2.) Any string that does not have a template literal (`${value}`) has to be closed with double quotation marks.
```js
func1(){
  // Wanted (Double quotations)
  const missing = "fox";

  // Wanted (Strings with template literals to be closed with backticks)
  const fullText = `This is a ${missing}.`;
}

func2(){
  // Not Wanted 
  const missing = 'fox';
  
  // Not Wanted
  const fullText = "This is a " + missing + ".";
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