/**
 * Run once a day on or after 13:30 PST for best results.
 * Fetches intraday data for all SP500 companies and saves them to a folder.
 * Author: Ben Cuan
 * Contributions: Alexey Kolechkin
 */

 import * as fs from 'fs';
 import a from 'alphavantage';

 const TIME_INTERVAL = 12000; //Time, in milliseconds, between each request.
 const alpha = a({key: 'key'});
 let stocks; //Array of strings for tickers

console.log('Reading stock ticker list');
fs.readFile('./src/SP_500_List.txt', 'utf8', (err, data) => {
    if(err)
        throw err;

    stocks = data;
})

stocks = ['test']
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
    // if(currStock >= stocks.length) {
        clearInterval(interval);
        console.log('Data collection complete');
    // }
    
}, TIME_INTERVAL);

