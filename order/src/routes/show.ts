import { NotAuthorizedError, NotFoundError, requireAuth } from '@amirzhan/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';


const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
        throw new NotFoundError();
    }
    if (req.currentUser!.id !== order.userId) {
        throw new NotAuthorizedError();
    }
    res.send(order);
});

export { router as showOrderRouter };