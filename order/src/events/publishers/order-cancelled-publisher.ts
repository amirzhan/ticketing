import { OrderCancelledEvent, Publisher, Subjects } from "@amirzhan/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}