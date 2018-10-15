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
const TIME_INTERVAL = 12000; //Time, in milliseconds, between each request.
let stocks; //Array of strings for tickers
let key;
let today = new Date();
let formattedDate = [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-');

readAPIKey();
initCommands();

function initCommands() {
    rl.prompt();
    rl.on('line', (line) => {
        
        switch (line.trim()) {
            case 'help':
                console.log('Help is on the way!');
                break;
            case 'exit':
                exit(0);
            default:
                console.log(`Command: '${line.trim()}' is not found.`);
                break;
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
        fs.writeFile('./key.txt', result.apikey, { flag: 'wx' }, function (err) {
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
    fs.readFile('./src/SP_500_List.txt', 'utf8', (err, data) => {
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
                rl.question('Directory already exists. Overwrite? (y/N)\n', (answer) => {
                    if (answer === 'y') {
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


let currStock = 0;
let interval;
function runCollection() {
    console.log('Server Initialized');
    console.log('Enter "exit" to stop server');
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
        });


    }, TIME_INTERVAL);
}

function incrementCollection() {
    currStock++;
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