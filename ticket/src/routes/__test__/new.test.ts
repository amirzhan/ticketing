import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({});
    expect(response.statusCode).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.statusCode).toEqual(401);
});

it('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

    expect(response.statusCode).not.toEqual(401);
});

it('returns an error if and invalid title is provided', async () => {
    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: '',
        price: 10
    }).expect(400);
    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        price: 10
    }).expect(400);

});

it('returns an error if and invalid price is provided', async () => {
    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'asdasd',
        price: -10
    }).expect(400);
    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'asddsasda'
    }).expect(400);
});

it('creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'asdadsads';

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title,
        price: 20
    }).expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(20);
    expect(tickets[0].title).toEqual(title);
});

it('publishes an event', async () => {
    const title = 'asdadsads';

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title,
        price: 20
    }).expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});