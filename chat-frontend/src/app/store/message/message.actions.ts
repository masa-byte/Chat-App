import { createAction, props } from '@ngrx/store';
import { Message } from 'src/app/message/message.model';

export const setSelectedMessageId = createAction('[Message] Set Selected Message Id', props<{ selectedMessageId: number }>());

export const loadMessages = createAction('[Message] Load Messages', props<{ clientSendId: number, clientReceiveId: number }>());
export const loadMessagesSuccess = createAction('[Message] Load Messages Success', props<{ messages: Message[] }>());
export const loadMessagesFailure = createAction('[Message] Load Messages Failure', props<{ error: any }>());

export const addMessage = createAction('[Message] Add Message', props<{ message: Message }>());

export const clearMessages = createAction('[Message] Clear Messages');