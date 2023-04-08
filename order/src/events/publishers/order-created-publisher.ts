import { OrderCreatedEvent, Publisher, Subjects } from "@amirzhan/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}