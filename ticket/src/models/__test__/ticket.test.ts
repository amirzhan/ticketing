import { Ticket } from "../ticket";


it('implements optimistic concurrenc control', async () => {
    // create an instance of a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    });
    
    // save the ticket to db
    await ticket.save();
    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);
    // fetch two separate changes to the tickets we fetched
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});
    // save the first fetched ticket
    await firstInstance!.save();
    // save the second fetched ticket and expect an error
    try {
        await secondInstance!.save();
    } catch(err) {
        return;
    }
    throw new Error('Should not reach this point');
});

it('increments version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
});