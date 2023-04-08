import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@amirzhan/common';
import { body } from 'express-validator';
import express, { Request, Response } from 'express';
import { natsWrapper } from '../nats-wrapper';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';


const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
    .not()
    .isEmpty()
    .withMessage('TicketId is required')
], validateRequest, async (req: Request, res: Response) => {
    
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved');
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)
    
    
    const order = Order.build({
        ticket,
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration
    });
    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        userId: order.userId,
        status: order.status,
        version: order.version,
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        expiresAt: order.expiresAt.toISOString()
    });
    res.status(201).send(order);
});

export { router as newOrderRouter }; 