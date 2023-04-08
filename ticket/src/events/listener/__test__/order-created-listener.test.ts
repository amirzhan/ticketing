import { OrderCreatedEvent, OrderStatus, TicketUpdatedEvent } from "@amirzhan/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'asdda'
    });
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: 'asd',
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        expiresAt: 'asdasd',
        status: OrderStatus.Created
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { data, msg, listener, ticket };
};

it('sets the orderId of the ticket', async () => {
    const {listener, data, msg, ticket} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const {listener, data, msg, ticket} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async () => {
    const { ticket, data, msg, listener } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]) as TicketUpdatedEvent['data'];
    expect(ticketUpdatedData.orderId).toEqual(data.id);
});