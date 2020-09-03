const fs = require("fs");


/**
 * get the current Operating System name
 * 
 * @returns {string} : the operating system short name 
 *  - "win" -> for Windows based Systems
 *  - "lin" -> for GNU/Linux based Systems
 */
getCurrentOs = () => {
    var processPlatform = process.platform;
    var currentOs;

    if (processPlatform === "win32"){
        currentOs = "win";
    }else if(processPlatform === "linux" || processPlatform === "openbsd" || processPlatform === "freebsd"){
        currentOs = "lin";
    } 

    return currentOs;
}