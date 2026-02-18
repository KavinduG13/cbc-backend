import express from 'express';
import { createOrder, getOrders, myOrders, updateOrderStatus } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.put("/status/:orderID", updateOrderStatus)
orderRouter.get("/my", myOrders)

export default orderRouter;