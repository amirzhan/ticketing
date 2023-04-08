import { ExpirationCompleteEvent, Publisher, Subjects } from "@amirzhan/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}