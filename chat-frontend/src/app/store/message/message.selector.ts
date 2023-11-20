import { createFeatureSelector, createSelector } from "@ngrx/store";
import { MessageState } from "./message.state";

export const selectMessage = createFeatureSelector<MessageState>('messages');

export const selectSelectedMessageId = createSelector(
    selectMessage,
    (state: MessageState) => state.selectedMessageId
);

export const selectMessages = createSelector(
    selectMessage,
    (state: MessageState) => state.entities
);