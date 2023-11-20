import { EntityState } from "@ngrx/entity";
import { Contact } from "src/app/client/client.model";

export interface ContactState extends EntityState<Contact> {
    myId: number | null;
    selectedContactId: number | null;
}