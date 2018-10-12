/**
 * Run once a day on or after 13:30 PST for best results.
 * Fetches intraday data for all SP500 companies and saves them to a folder.
 * Author: Ben Cuan
 * Contributions: Alexey Kolechkin
 */

 import * as fs from 'fs';
 import a from 'alphavantage';
 import {exec} from 'child_process';
 import * as readline from 'readline';

 const TIME_INTERVAL = 12000; //Time, in milliseconds, between each request.
 const alpha = a({key: 'key'});
 let stocks; //Array of strings for tickers

console.log('Reading stock ticker list');
fs.readFile('./src/SP_500_List.txt', 'utf8', (err, data) => {
    if(err)
        throw err;

    stocks = data;
})

mkdir();

console.log('Creating data directory');
function mkdir() {
    let today = new Date();
    let formattedDate = [today.getFullYear(), today.getMonth(), today.getDay()].join('-');
    console.log('Today is ' + formattedDate);
    exec ('mkdir ' + 'src/data/' + formattedDate, (err, stdout, stderr) => {
        if(stderr)
            if(stderr.toString().includes('cannot create directory')) {
                const r1 = readline.createInterface({
                    input: process.stdin, 
                    output: process.stdout
                });
                r1.question('Directory already exists. Overwrite? (y/N)\n', (answer) => {
                    if(answer === 'y') {
                        exec('rm -r ' + 'src/data/' + formattedDate, () => {
                            exec('mkdir ' + 'src/data/' + formattedDate, () => {
                                r1.close();
                                runCollection();
                            });
                        });
                    }
                    else
                        console.log('Exiting...');
                })

            }
            else throw new Error(stderr);
        else if (err)
            throw new Error(err);
        else
            runCollection();
    });
}


function runCollection() {
    console.log('Server Initialized');
    
    let currStock = 0;
    let interval = setInterval(() => {
        console.log('Fetching data for ');
        // alpha.data.intraday(`msft`).then(data => {
            //     console.log(data);
            // });
        currStock++;
        console.log(stocks.length);
        console.log(currStock);
        if(currStock >= stocks.length) {
            clearInterval(interval);
            console.log('Data collection complete');
        }
        
    }, TIME_INTERVAL);
}

