import { Publisher, Subjects, TicketUpdatedEvent } from "@amirzhan/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}