import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, } from '@ngrx/effects';
import { switchMap, map, catchError, of } from 'rxjs';
import { MessageService } from 'src/app/message/message.service';
import * as MessageActions from './message.actions';
import { Message } from 'src/app/message/message.model';

@Injectable()
export class MessageEffects {
    constructor(
        private actions$: Actions,
        private messageService: MessageService
    ) { }

    loadMessages$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MessageActions.loadMessages),
            switchMap(({ clientSendId, clientReceiveId }) =>
                this.messageService.getMessages(clientSendId, clientReceiveId).pipe(
                    map((response) => {
                        let body = response.body;
                        let allMessagees: Message[] = body.map((message: Message) => {
                            return {
                                sentByUser: message.sentByUser,
                                fileName: message.fileName.substring(0, message.fileName.lastIndexOf('.')),
                                content: message.content
                            };
                        });

                        return MessageActions.loadMessagesSuccess({ messages: allMessagees });
                    }),
                    catchError((error) => {
                        return of(MessageActions.loadMessagesFailure({ error: 'Failed to load messages' }));
                    })
                )
            )
        )
    );
}