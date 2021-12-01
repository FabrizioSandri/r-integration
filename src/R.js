const fs = require("fs");
var child_process = require('child_process');


/**
 * get the current Operating System name
 * 
 * @returns {string} the operating system short name 
 *  - "win" -> for Windows based Systems
 *  - "lin" -> for GNU/Linux based Systems
 *  - "mac" -> for MacOS based Systems
 */
getCurrentOs = () => {
    var processPlatform = process.platform;
    var currentOs;

    if (processPlatform === "win32"){
        currentOs = "win";
    }else if(processPlatform === "linux" || processPlatform === "openbsd" || processPlatform === "freebsd"){
        currentOs = "lin";
    }else {
        currentOs = "mac"
    }   

    return currentOs;
}


/**
 * execute a command in the OS shell (used to execute R command)
 * 
 * @param {string} command the command to execute
 * @returns {{string, string}} the command execution result
 */
executeShellCommand = (command) => {
    let stdout;
    let stderr;

    try {
        stdout = child_process.execSync(command,  {stdio : 'pipe' }).toString();
        stdout = stdout.replace(/\"/g, '');
    }catch(error){
        stderr = error;
    }

    return {stdout, stderr};
}

/**
 * checks if Rscript(R) is installed od the system and returns
 * the path where the binary is installed
 * 
 * @returns {string} the path where the Rscript binary is installed, null otherwise
 */
isRscriptInstallaed = () => {
    var installationDir = null;

    switch(getCurrentOs()){
        case "win":
            if (fs.lstatSync("C:\\Program Files\\R").isDirectory()){
                // Rscript is installed, let's find the path (verison problems)
                installationDir = "C:\\Program Files\\R";

                fs.readdirSync(installationDir).forEach(obj => {
                    installationDir += `\\${obj}\\bin\\Rscript.exe`;
                });
            }
            break;
        case "mac":
        case "lin":
            // the command "which" is used to find the Rscript installation dir
            let result = executeShellCommand("which Rscript").stdout;
            if (result){
                // Rscript is installed
                installationDir = result.replace("\n", "");
            }
            break;
        default:
            break;
    }

    return installationDir;
}

/**
 * Execute in R a specific one line command
 * 
 * @param {string} command the single line R command
 * @returns {String[]} an array containing all the results from the command execution output, null if there was an error
 */
executeRCommand = (command) => {

    let RscriptBinaryPath = isRscriptInstallaed();
    let output;

    if (RscriptBinaryPath){
        var commandToExecute = `"${RscriptBinaryPath}" -e "${command}"`;
        var commandResult = executeShellCommand(commandToExecute);

        if (commandResult.stdout){
            output = commandResult.stdout;
            output = filterMultiline(output);
        }else{
            console.error(`[R: compile error] ${commandResult.stderr.stderr}`);
        }

    }else{
        console.error("R not found, maybe not installed.\nSee www.r-project.org");
    }

    return output;
}

/**
 * Execute in R a specific one line command - async
 * 
 * @param {string} command the single line R command
 * @returns {String[]} an array containing all the results from the command execution output, null if there was an error
 */
executeRCommandAsync = (command) => {
    return new Promise(function(resolve, reject) {

        var result = executeRCommand(command);
       
        if (result){
            resolve(result);
        }else{
            reject("ERROR: there was an error");
        }
    });
}

/**
 * execute in R all the commands in the file specified by the parameter fileLocation
 * NOTE: the function reads only variables printed to stdout by the cat() or print() function.
 * It is recommended to use the print() function insted of the cat() to avoid line break problem.
 * If you use the cat() function remember to add the newline character "\n" at the end of each cat:
 * for example cat(" ... \n")
 * 
 * @param {string} fileLocation where the file to execute is stored
 * @returns {String[]} an array containing all the results from the command execution output, null if there was an error
 */
executeRScript = (fileLocation) => {
   
    let RscriptBinaryPath = isRscriptInstallaed();
    let output;

    if (! fs.existsSync(fileLocation)) {
        //file doesn't exist
        console.error(`ERROR: the file "${fileLocation} doesn't exist"`);
        return output;     
    }

    if (RscriptBinaryPath){
        var commandToExecute = `"${RscriptBinaryPath}" "${fileLocation}"`;
        var commandResult = executeShellCommand(commandToExecute);

        if (commandResult.stdout){
            output = commandResult.stdout;
            output = filterMultiline(output);
        }else{
            console.error(`[R: compile error] ${commandResult.stderr.stderr}`);
        }

    }else{
        console.error("R not found, maybe not installed.\nSee www.r-project.org");
    }

    return output;

}

/**
 * Formats the parameters so R could read them
 */
convertParamsArray = (params) => {
    var methodSyntax = ``;  

    if (Array.isArray(params)){
        methodSyntax += "c(";

        params.forEach((element) => {
            methodSyntax += convertParamsArray(element) ;
        });
        methodSyntax = methodSyntax.slice(0,-1);
        methodSyntax += "),";
    }else if (typeof params == "string"){
        methodSyntax += `'${params}',`;
    }else {
        methodSyntax += `${params},`;
    }

    return methodSyntax;
}


/**
 * calls a R function with parameters and returns the result
 * 
 * @param {string} fileLocation where the file containing the function is stored
 * @param {string} methodName the name of the method to execute
 * @param {String []} params a list of parameters to pass to the function 
 * @returns {string} the execution output of the function
 */
callMethod = (fileLocation, methodName, params) => {
    let output;

    if (!methodName || !fileLocation || !params){
        console.error("ERROR: please provide valid parameters - methodName, fileLocation and params cannot be null");
        return output;
    }

    var methodSyntax = `${methodName}(`;  

    // check if params is an array of parameters or an object
    if (Array.isArray(params)){
        params.forEach((element) => {
            methodSyntax += convertParamsArray(element);
        });
    }else{
        for (const [key, value] of Object.entries(params)) {
            if (Array.isArray(value)){
                methodSyntax += `${key}=${convertParamsArray(value)}`;
            }else if (typeof value == "string"){
                methodSyntax += `${key}='${value}',`;   // string preserve quotes
            }else{
                methodSyntax += `${key}=${value},`;
            }
        }
    }

    var methodSyntax = methodSyntax.slice(0,-1);
    methodSyntax += ")";

    output = executeRCommand(`source('${fileLocation}') ; print(${methodSyntax})`);
    
    return output;
}

/**
 * calls a R function with parameters and returns the result - async
 * 
 * @param {string} fileLocation where the file containing the function is stored
 * @param {string} methodName the name of the method to execute
 * @param {String []} params a list of parameters to pass to the function
 * @returns {string} the execution output of the function
 */
callMethodAsync = (fileLocation, methodName, params) => {
    return new Promise(function(resolve, reject) {

        var result = callMethod(fileLocation, methodName, params);

        if (result) {
            resolve(result);
        }else{
            reject("ERROR: there was an error");
        }
    })
}



/**
 * filters the multiline output from the executeRcommand and executeRScript functions
 * using regular expressions
 * 
 * @param {string} commandResult the multiline result of RScript execution
 * @returns {String[]} an array containing all the results 
 */
filterMultiline = (commandResult) => {
    let data;

    // remove last newline to avoid empty results
    // NOTE: windows newline is composed by \r\n, GNU/Linux and Mac OS newline is \n
    var currentOS = getCurrentOs();

    if (currentOS == "win"){
        commandResult = commandResult.replace(/\r\n$/g, "");
        data = commandResult.split("\r\n");
    }else{
        commandResult = commandResult.replace(/\n$/g, "");
        data = commandResult.split("\n");
    }

    data.forEach((element, index) => {
        data[index] = element.replace(/\[.\] /g, "");
    });

    return data;
}

module.exports = {
    executeRCommand,
    executeRCommandAsync,
    executeRScript,
    callMethod,
    callMethodAsync
}
