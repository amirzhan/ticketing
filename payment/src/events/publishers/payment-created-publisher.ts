import { Publisher, PaymentCreatedEvent, Subjects } from "@amirzhan/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    readonly subject = Subjects.PaymentCreated;
    
}