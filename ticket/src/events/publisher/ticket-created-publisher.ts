import { Publisher, Subjects, TicketCreatedEvent } from "@amirzhan/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}