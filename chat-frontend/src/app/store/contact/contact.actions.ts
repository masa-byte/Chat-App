import { createAction, props } from '@ngrx/store';


export const setMyId = createAction('[Contact] Set My Id', props<{ myId: number }>());

export const setSelectedContactId = createAction('[Contact] Set Selected Contact Id', props<{ selectedContactId: number }>());