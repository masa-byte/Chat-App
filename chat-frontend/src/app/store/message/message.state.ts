import { EntityState } from "@ngrx/entity";
import { Message } from "src/app/message/message.model";

export interface MessageState extends EntityState<Message> {
    selectedMessageId: number | null;
    ids: string[];
}