import express, { Express } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import logger from './src/lib/logger';
import router from './src/router';

dotenv.config();

const port = process.env.PORT || 3000;

const app: Express = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// RestApi router
app.use('/api', router);

app.listen(port, () => {
   logger.info(`Server is running at http://localhost:${port}`);
});
