import express, { Request, Response } from 'express';
import CurrencyExchangerController from './controllers/CurrencyExchangerController';
import knexInstance from './lib/knex/knex';

const router = express.Router();

router.get('/healthcheck', (req: Request, res: Response) => {
   res.send('Ok');
});

// Create a CurrencyExchangerController instance
const currencyExchangerController = new CurrencyExchangerController(knexInstance);

// Route handler to get the top currency exchangers
router.get('/', async (req: Request, res: Response) => {
   try {
      // Retrieve the top currency exchangers
      const topCurrencyExchangers = await currencyExchangerController.getTopCurrencyExchangers();

      res.json(topCurrencyExchangers);
   } catch (error) {
      console.error('Error retrieving top currency exchangers:', error);
      res.status(500).json({ error: 'Internal Server Error' });
   }
});

export default router;
