import { createReducer, on } from "@ngrx/store";
import { MessageState } from "./message.state";
import * as MessageActions from './message.actions';
import { Message } from "src/app/message/message.model";

const initialState: MessageState = {
    selectedMessageId: null,
    ids: [],
    entities: {}
};

export const messageReducer = createReducer(
    initialState,
    on(MessageActions.setSelectedMessageId, (state, { selectedMessageId }) => {
        return {
            ...state,
            selectedMessageId
        }
    }),
    on(MessageActions.loadMessagesSuccess, (state, { messages }) => {
        return {
            ...state,
            ids: messages.map(message => message.fileName),
            entities: messages.reduce((entities: { [id: number]: Message }, message: Message) => {
                return {
                    ...entities,
                    [message.fileName]: message
                };
            }, {}),
            error: null
        };
    }),
    on(MessageActions.loadMessagesFailure, (state, { error }) => {
        return {
            ...state,
            error
        }
    }),
    on(MessageActions.addMessage, (state, { message }) => {
        return {
            ...state,
            ids: [...state.ids, message.fileName],
            entities: {
                ...state.entities,
                [message.fileName]: message
            }
        };
    }),
    on(MessageActions.clearMessages, (state) => {
        return {
            ...state,
            ids: [],
            entities: {}
        };
    })
);