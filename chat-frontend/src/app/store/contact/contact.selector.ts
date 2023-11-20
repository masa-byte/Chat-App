import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ContactState } from "./contact.state";

export const selectContact = createFeatureSelector<ContactState>('contact');

export const selectMyId = createSelector(
    selectContact,
    (state: ContactState) => state.myId
);

export const selectSelectedContactId = createSelector(
    selectContact,
    (state: ContactState) => state.selectedContactId
);