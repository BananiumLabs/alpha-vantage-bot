# AlphaVantage Bot

Collects data on intraday statistics and stores locally.

Developed by [Ben Cuan](https://github.com/dbqeo), [Alexey Kolechkin](https://github.com/kuxxe), and [Eric Qian](https://github.com/enumc)

## Running locally

You need your own AlphaVantage API key to use this bot! Create a file `key.txt` containing only your key in the root directory.
If you didn't create a key, there will be a prompt to enter it in through the command line.

Data is saved in folders named after the date, i.e. `yyyy-mm-dd` within the parent folder `src/data`.

To run, simply `npm i` then `npm start`.

For development using nodemon, run `npm run develop`.

## Customization
 - **Timeout:** The default setting is 5 API calls per minute (limit for free API key). You can change this by editing the `TIME_INTERVAL` constant in `main.js`.
 - **Collected Tickers:** The default list of tickers is `Ticker_List.txt`, which currently contains all of the S&P 500 tickers that work with AlphaVantage. If you want to change what is collected, enter one ticker per line on this file. You can add or remove as many as you'd like.
 - **Scheduling:** You may want to schedule this bot to run once a day, once a week, continuously, etc. If you are using Windows, use Git Bash with the Task Scheduler; if using Linux (Preferred), you can set a cronjob. I will trust that you know how to do this/know where to find instructions for doing so.
 
## Known issues
 - On Windows, overwriting directories fails if bash/cmd does not have administrator permissions.
