import express from 'express';
import { recordStockMovement, getTransactions } from '../controllers/stockController.js';

const router = express.Router();

router.post('/movements', recordStockMovement);
router.get('/transactions', getTransactions);

export default router;
