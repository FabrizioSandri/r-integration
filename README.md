# R-integration - Node JS  API

This is the R-integration API which allows you to execute arbitrary R commands or scripts directly from the node JS environment. This integration works on Windows and GNU/Linux based systems and uses system calls to access the R binary.

## Installation

### Node JS

```bash
npm install r-integration
```

## Usage

### Run a simple command
You can run a simple R command by using the `executeRCommand(command)` function which takes a String as parameter (the command to execute) and returns a String Array containing the results
```js
// In NodeJS
const R = require('r-integration');

let result = R.executeRCommand("max(1,2,3)");
console.log(result);

> [ '3' ]
```

Additionally if you want to execute multiple commands you can pass them, comma separated, in the `command` parameter

```js
const R = require('r-integration');

let result = R.executeRCommand("max(1,2,3); min(1,2,3); exp(2)*pi");
console.log(result);

> [ '3', '1', '23.2134' ]
```

### Run an external script
If you want to run a complex and external script, instead of passing all of the comma separated commands to the `executeRCommand(command)` function, you can use the `executeRScript(file_location)` function, which takes a String file_location as parameter(the location where the file is stored) and returns a String Array containing all the results of the R script execution.

**NOTE:** in order to read all the results you have to explicitly use the `print()` function in R to send a variable/data to the result Array in Node JS.

##### Example
Suppose we have a R script located in `./scripts/test.R`
```R
# In R
x <- 5
y <- 6
z <- 3
result <- max(x, y, z)

print(result)
```
As you can see we exposed the `result` variable with the `print()` function in order to read it from the Node JS environment. Now we can compile the R script and finally read that variable from Node JS
```js
// In NodeJS
const R = require('r-integration');

let result = R.executeRScript("./scripts/test.R");
console.log(result);

> [ '6' ]
```

### Call a R function with parameters
If you want to execute a R function in an external file you can use the `callMethod` function by passing the fileLocation, methodName (function to call) and params (the params passed to methodName at call). Note that params must be an array of parameters or an Object in the format {variableName: "value"}


##### Example
Suppose we have a R script located in `./scripts/test.R`
```R
x = function(data) {
    return(data * 2)
}
```
Now from the NodeJS environment we can call the `x` function 
```js
// In NodeJS
const R = require('r-integration');

let result = R.callMethod("./scripts/test.R", "x", ["2"]);
console.log(result);

> [ '4' ]
```

Alternative: Object as parameter
```js
// In NodeJS
const R = require('r-integration');

let result = R.callMethod("./scripts/test.R", "x", {data: "2"});
console.log(result);

> [ '4' ]
```

### Async calls
If you need to execute asynchronously the functions `executeRCommand` and `callMethod` you have to use `executeRCommandAsync` and `callMethodAsync`by using promises


##### Example
Suppose we have a R script located in `./scripts/test.R`
```R
x = function(data) {
    return(data * 2)
}
```
Then in Node JS you can use promises in the following way
```js
// In NodeJS
const R = require('r-integration');

callMethodAsync("./scripts/test.R", "x", ["2"]).then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
})

> [ '4' ]
```


### R scripts syntax rules
In order to read the R script output from the Node JS environment you can use 2 methods
 1. use the R `print(...)` function 
 2. use the R `cat(...)` function

It's recommended to use `print()`  instead of `cat()`. 
**IMPORTANT:** If you use `cat()`  remember to put the newline character `\n` at the end of each cat call. 
In the previous example we used `print()`. This was equal to use cat() in the following way
```R
# file ./scripts/test.R
x <- 5
y <- 6
z <- 3
result <- max(x, y, z)

cat(result, sep="\n")
```

## Building Requirements

-   [R](https://www.r-project.org/)
-   [Node.js](https://nodejs.org)
-   [npm](https://www.npmjs.com/)

#### Windows / Mac OS
For Windows and Mac OS users refer to the links above.

#### Ubuntu - Debian
```bash
sudo apt-get install r-base
sudo apt-get install nodejs
sudo apt-get install npm
```

#### Arch Linux
```bash
sudo pacman -S r
sudo pacman -S nodejs
sudo pacman -S npm
```
