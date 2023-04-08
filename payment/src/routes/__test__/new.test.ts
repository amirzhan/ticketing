import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Order, OrderStatus } from "../../models/order";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'asdadsad',
        orderId: new mongoose.Types.ObjectId().toHexString()
    }).expect(404);
});

it('returns a 401 when purchasing an order doesnt belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Created,
        version: 0,
        userId: 'asd'
    });
    await order.save();
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'asdasads',
        orderId: order.id
    }).expect(401);
});

it('returns a 400 when purchasing cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Cancelled,
        version: 2,
        userId
    });
    await order.save();
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'asadssda',
        orderId: order.id
    }).expect(400);
});

it('returns a 204 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price,
        status: OrderStatus.Created,
        version: 0,
        userId
    });
    await order.save();
    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
        token: 'tok_visa',
        orderId: order.id
    }).expect(201);

    const stripeCharges = await stripe.charges.list({limit:50});
    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price*100;
    });
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');

    const payment = await Payment.find({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });
    expect(payment).not.toBeNull();
});