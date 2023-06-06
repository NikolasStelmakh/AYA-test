# AYA-test

1) Download repo
2) Install `docker-compose` on your pc
3) Create `.env` file in `api` directory and paste values from `.env.example`
4) Open terminal in root directory and run: `docker-compose build`
5) Run: `docker-compose up`
6) Open terminal in root directory and run `npm run migrate:up` to build db schema
7) Run `npm run parse:dump` to parse `input.txt` file and store data into db
8) Open browser and go to `localhost:3000/api`


#Answers:
1. How to change the code to support different file format versions? 
A: Update parseDumpData or create a separate method for different extensions if the logic becomes more complex (hard to read for a human)
2. How will the import system change if in the future we need to get this data from a web API?
A: For that case can be used responseStream `{ responseType: 'stream' }`  for `get` request. And other logic will work in pretty same way with minor updates.
3. If in the future it will be necessary to do the calculations using the national bank rate, how could this be added to the system?
A: Determine the official or trusted source. Add a cron job to get and store the date in our db via some interval.
4. How would it be possible to speed up the execution of requests if the task allowed you to update market data once a day or even less frequently? Please explain all possible solutions you could think of.
A: 1) Schedule cron job at specific intervals (e.g., once a day).
A: 2) Batch Processing: Instead of making individual requests for each data item, implement batch processing - fetch and process multiple data items in a single request.
A: 3) Parallel Processing: We can try to parallelize requests and their processing through different workers (lambda functions of Amazon, for example)
