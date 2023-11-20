import { createReducer, on } from "@ngrx/store";
import { ContactState } from "./contact.state";
import * as ContactActions from './contact.actions';

const initialState: ContactState = {
    myId: null,
    selectedContactId: null,
    ids: [],
    entities: {}
};

export const contactReducer = createReducer(
    initialState,
    on(ContactActions.setMyId, (state, { myId }) => {
        return { 
            ...state, 
            myId: myId 
        };
    }),
    on(ContactActions.setSelectedContactId, (state, { selectedContactId }) => {
        return { 
            ...state, 
            selectedContactId: selectedContactId 
        };
    }),
);