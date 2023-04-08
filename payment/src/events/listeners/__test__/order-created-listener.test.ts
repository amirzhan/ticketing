import { OrderCreatedEvent, OrderStatus, TicketCreatedEvent } from "@amirzhan/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'concert',
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: '123',
            price: 10
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {
        listener, data, msg
    }
};

it('creates and saves an order', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    const order = await Order.findById(data.id);
    expect(order).toBeDefined();
    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});