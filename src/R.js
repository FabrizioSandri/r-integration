const fs = require("fs");
var child_process = require('child_process');


/**
 * get the current Operating System name
 * 
 * @returns {string} : the operating system short name 
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
 * @param {string} command : the command to execute
 * @returns {string, string} : the command execution result
 */
executeShellCommand = (command) => {
    let stdout;
    let stderr;

    try {
        stdout = child_process.execSync(command,  {stdio : 'pipe' }).toString()
    }catch(error){
        stderr = error;
    }

    return {stdout, stderr};
}

/**
 * checks if Rscript(R) is installed od the system and returns
 * the path where the binary is installed
 * 
 * @returns {string} : the path where the Rscript binary is installed, null otherwise
 */
isRscriptInstallaed = () => {
    var installationDir = null;

    switch(getCurrentOs()){
        case "win":
            if (fs.lstatSync("C:\\Program Files\\R").isDirectory()){
                // Rscript is installed, let's find the path (verison problems)
                installationDir = "C:\\Program Files\\R";

                fs.readdirSync(installationDir).forEach(obj => {
                    installationDir += `\\${obj}\\Rscript.exe`;
                });
            }
        case "lin":
            // the command "which" is used to find the Rscript installation dir
            let result = executeShellCommand("which Rscript").stdout;
            if (result){
                // Rscript is installed
                installationDir = result.replace("\n", "");
            }
        case "mac":
            // TODO: not yet implemented
    }

    return installationDir;
}

/**
 * Execute in R a specific one line command
 * 
 * @param {string} command : the single line R command
 * @returns {string} : the command execution output, null if there was an error
 */
executeRCommand = (command) => {

    let RscriptBinaryPath = isRscriptInstallaed();
    let output;

    if (RscriptBinaryPath){
        var commandToExecute = `${RscriptBinaryPath} -e "${command}"`;
        var commandResult = executeShellCommand(commandToExecute);

        if (commandResult.stdout){
            output = commandResult.stdout.replace("\n", "");
            output = output.substring(4); // removes the line number
        }else{
            console.error(`[R: compile error] ${commandResult.stderr.stderr}`);
        }

    }else{
        console.error("R not found, maybe not installed.\nSee www.r-project.org");
    }

    return output;
}

/**
 * execute in R all the commands in the file specified by the parameter fileLocation
 * NOTE: the function reads only variables printed by the cat() or print() function.
 * It is recommended to use the cat() function insted of the print() to avoid line numbers
 * 
 * @param {string} fileLocation: where the file to execute is stored
 * @returns {string} :  the script execution output, null if there was an error
 */
executeRScript = (fileLocation) => {
   
    let RscriptBinaryPath = isRscriptInstallaed();
    let output;

    if (RscriptBinaryPath){
        var commandToExecute = `${RscriptBinaryPath} "${fileLocation}"`;
        var commandResult = executeShellCommand(commandToExecute);

        if (commandResult.stdout){
            output = commandResult.stdout;
        }else{
            console.error(`[R: compile error] ${commandResult.stderr.stderr}`);
        }

    }else{
        console.error("R not found, maybe not installed.\nSee www.r-project.org");
    }

    return output;

}

module.exports = {
    executeRCommand,
    executeRScript
}
