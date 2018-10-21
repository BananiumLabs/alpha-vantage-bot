/**
 * Run once a day on or after 13:30 PST for best results.
 * Fetches intraday data for all SP500 companies and saves them to a folder.
 * Author: Ben Cuan
 * Contributions: Alexey Kolechkin
 */

import * as fs from 'fs';
import a from 'alphavantage';
import * as readline from 'readline';
import rimraf from 'rimraf';
import * as prompt from 'prompt';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'console> '
  });

const DEBUG = true;
const TIME_INTERVAL = 16000; //Time, in milliseconds, between each request.
const ERROR_LIMIT = 4; //places a limit on how many errors are allowed per ticker before proceeding to the next
let errorCounter = 0; //counts the amount of retries for each ticker, whether to move on or not
let stocks; //Array of strings for tickers
let key; // To be loaded from key.txt

let today = new Date();
let formattedDate = [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-');

let currStock = 0; //current stock index
let interval; //setInterval() reference

readAPIKey();
initCommands();

function initCommands() {
    rl.prompt();
    rl.on('line', (line) => {
        let lineStr = '' + line.trim();
        if(lineStr.startsWith('help')) {
            console.log('List of commands: ');
            console.log('exit - Stops data collection.');
            console.log('skip - Skips specified number of entries. Usage: `skip n` where n is a number.');
        }
        else if(lineStr.startsWith('exit'))
            exit(0);
        else if(lineStr.startsWith('skip')) {
            let param = lineStr.split(' ')[1];
            if(!isNaN(param)) {
                console.log('Skipping ' + param + ' tickers.')
                currStock += parseInt(param);
                
                if(stocks === undefined || stocks === null)
                    console.log('Stocks have not been initialized yet. Please try again in a moment.');
                else {
                    if(currStock < 0 || currStock > stocks.length) {
                        console.log('The resultant index is out of bounds: ' + currStock);
                        exit(1);
                    }
                    else {
                        console.log('Now collecting ticker ' + stocks[currStock]);
                    }
                }
            }
        }
        else {
            console.log('Command not found: ' + lineStr);
        }

        rl.prompt();
      }).on('close', () => {
        console.log('Console CLI terminated!');
      });
}

// Creates key file if it does not yet exist and run readKey
function createAPIKeyFile() {
    prompt.start();
    console.log("Missing API Key! Please enter the following details: ");
    prompt.get(['apikey'], function (err, result) {
        fs.writeFile('./key.txt', result.apikey, { flag: 'wx' }, (err) => {
            if (err) {
                console.err("Key file generation FAILED. Please check stacktrace.");
                throw err;
            }
            else {
                console.log("API Key stored successfully: " + result.apikey);
                readAPIKey();
            }
        });
    });
    
}
function readAPIKey() {
    fs.readFile('./key.txt', 'utf8', (err, data) => {
        console.log('Loading key.txt');
        if (err) {
            createAPIKeyFile();
        }
        else {
            key = data;
            readStocks();
        }
    })
}

function readStocks() {
    fs.readFile('./src/Ticker_List.txt', 'utf8', (err, data) => {
        console.log('Reading stock ticker list');
        if (err)
            throw err;

        stocks = data.split('\r\n');
        mkdir();
    })
}

function mkdir() {
    console.log('Today is ' + formattedDate);
    console.log('Creating data directory');
    fs.mkdir('src/data/' + formattedDate, (err) => {
        if(err) {
            // Dir already exists
            if(err.errno === -17 || ('' + err).includes('EEXIST')) {
                rl.question('Directory already exists. Overwrite? (Y/N)\n', (answer) => {
                    if (answer === 'y' || 'Y') {
                        rimraf('src/data/' + formattedDate, (err) => {
                            if(err)
                                throw err;
                            fs.mkdir('src/data/' + formattedDate, (err) => {
                                if(err)
                                    throw err;
                                runCollection();
                            });
                        });
                    }
                    else
                        exit();
                });
            }
            else
                throw err;
        }
        else
            runCollection();
            
    });
}


function runCollection() {
    console.log('Server Initialized');
    console.log('Enter "exit" to stop server');
    console.log('Enter "help" for more commands');
    rl.prompt();
    const alpha = a({ key: key });

    interval = setInterval(() => {
        

        alpha.data.intraday(stocks[currStock]).then(data => {
            fs.appendFile('src/data/' + formattedDate + '/' + stocks[currStock] + '.json', JSON.stringify(data), (err, data) => {
                if (err)
                    console.log(err);
                else {
                    if (DEBUG)
                        console.log('[' + new Date() + '] Successfully fetched data for ' + stocks[currStock]);
                    incrementCollection();
                }
            });
        }).catch((err) => {
            // Overloaded API calls is a safe error, ignore this.
            if (('' + err).includes('higher API')) {
                console.log('Max API calls exceeded while fetching ' + stocks[currStock] + ', make sure you have the correct TIME_INTERVAL and only have one instance running!')
            }
            else {
                console.log('Critical error fetching stock ' + stocks[currStock] + ': ' + err);
                errorCounter++;
                if(errorCounter>=ERROR_LIMIT){
                    console.log(stocks[currStock] + ' has been skipped.');
                    incrementCollection();
                }
            }
        });




    }, TIME_INTERVAL);
}

function incrementCollection() {
    currStock++;
    errorCounter = 0;
    if (currStock >= stocks.length) {
        clearInterval(interval);
        console.log('Data collection complete');
    }
}

function exit(code) {
    console.log("Program is cleaning up... Please wait.");
    process.exit(code);
}

if (process.platform === "win32") {
  
    rl.on("SIGINT", function () {
        process.emit("SIGINT");
        console.log("Exiting... Please wait.");
    });
}
  
process.on("SIGINT", function () {
    //graceful shutdown
    exit(0);
});