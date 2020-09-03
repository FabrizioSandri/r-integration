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