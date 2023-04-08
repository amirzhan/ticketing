import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';


it('returns a 404 if provided id is does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'asdasd',
        price: 10
    }).expect(404);
});
it('returns a 401 if the user not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`)
    .send({
        title: 'asdasd',
        price: 10
    }).expect(401);
});
it('returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app).post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'asddas',
        price: 10
    }).expect(201);
    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'qweqwe',
        price: 100
    }).expect(401);
});
it('returns a 400 if the user provides wrong title or price', async () => {
    const cookie = global.signin();
    const response = await request(app).post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'asddas',
        price: 10
    }).expect(201);
    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: '',
        price: 20
    }).expect(400);
    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'asdasdads',
        price: -20
    }).expect(400);
});
it('updates ticket if valid inputs provided', async () => {
    const cookie = global.signin();
    const response = await request(app).post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'asddas',
        price: 10
    }).expect(201);
    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'updated title',
        price: 20
    }).expect(200);
    const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send({});
    expect(ticketResponse.body.title).toEqual('updated title');
    expect(ticketResponse.body.price).toEqual(20);
});

it('published an event', async () => {
    const cookie = global.signin();
    const response = await request(app).post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'asddas',
        price: 10
    }).expect(201);
    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'updated title',
        price: 20
    }).expect(200);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();
    const response = await request(app).post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'asddas',
        price: 10
    }).expect(201);
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();
    await request(app).put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title: 'updated title',
        price: 20
    }).expect(400);
});