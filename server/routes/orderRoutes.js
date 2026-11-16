import express from 'express';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  updateOrderStatus,
  deletePurchaseOrder,
} from '../controllers/orderController.js';

const router = express.Router();

router.route('/').get(getPurchaseOrders).post(createPurchaseOrder);
router.route('/:id/status').patch(updateOrderStatus);
router.route('/:id').delete(deletePurchaseOrder);

export default router;
