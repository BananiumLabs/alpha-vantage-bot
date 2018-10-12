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

console.log('Server Initialized');

setInterval(() => {
    console.log('Fetching data for ');
    alpha.data.intraday(`msft`).then(data => {
        console.log(data);
    });
}, TIME_INTERVAL);