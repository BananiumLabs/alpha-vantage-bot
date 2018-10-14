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

const TIME_INTERVAL = 12000; //Time, in milliseconds, between each request.
let stocks; //Array of strings for tickers
let key;
let today = new Date();
let formattedDate = [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-');

readKey();

function readKey() {
    fs.readFile('./key.txt', 'utf8', (err, data) => {
        console.log('Loading key.txt');
        if (err)
            throw err;
        key = data;
        readStocks();
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
                const r1 = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                });
                r1.question('Directory already exists. Overwrite? (y/N)\n', (answer) => {
                    if (answer === 'y') {
                        rimraf('src/data/' + formattedDate, (err) => {
                            if(err)
                                throw err;
                            fs.mkdir('src/data/' + formattedDate, (err) => {
                                if(err)
                                    throw err;
                                r1.close();
                                runCollection();
                            });
                        });
                    }
                    else
                        console.log('Exiting...');
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
    const alpha = a({ key: key });

    interval = setInterval(() => {
        alpha.data.intraday(stocks[currStock]).then(data => {
            fs.appendFile('src/data/' + formattedDate + '/' + stocks[currStock] + '.json', JSON.stringify(data), (err, data) => {
                if (err)
                    console.log(err);
                else {
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