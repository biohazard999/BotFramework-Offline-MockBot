// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ConnectionStatus } from 'botframework-directlinejs';
import { BotAdapter, ConversationState, MemoryStorage, TurnContext, UserState } from 'botbuilder-core';
import Observable from 'core-js/features/observable';

import MockBot from '../MockBot';

export const USER_PROFILE = { id: 'user', name: 'user', role: 'user' };
export const BOT_PROFILE = { id: 'bot', name: 'bot', role: 'bot' };

/**
 * Custom BotAdapter used for deploying a bot in a browser.
 */
export default class WebChatAdapter extends BotAdapter {
    constructor() {
        super();

        this.botConnection = {
            connectionStatus$: new Observable(observer => {
                observer.next(ConnectionStatus.Uninitialized);
                observer.next(ConnectionStatus.Connecting);
                observer.next(ConnectionStatus.Online);
            }),
            activity$: new Observable(observer => {
                this.activityObserver = observer;
            }),
            end() {
                // The React component was called to unmount:
                // https://github.com/Microsoft/BotFramework-WebChat/blob/57360e4df92e041d5b0fd4810c1abf96621b5283/src/Chat.tsx#L237-L247
                // Developers will need to decide what behavior the component should implement.
                // For this sample, this.botConnection.componentWillUnmount() and this.botConnection.end()
                // is never called.
                console.log('this.botConnection.componentWillUnmount() called.');
            },
            getSessionId: () => new Observable(observer => observer.complete()),
            postActivity: activity => {
                const id = Date.now() + Math.random().toString(36);

                return new Observable(observer => {
                    const serverActivity = {
                        ...activity,
                        id,
                        conversation: { id: 'bot' },
                        channelId: 'webchat-adapter',
                        from: USER_PROFILE,
                        recipient: BOT_PROFILE,
                        timestamp: new Date().toISOString()
                    };

                    this.onReceive(serverActivity).then(() => {
                        observer.next(id);
                        observer.complete();

                        this.activityObserver.next(serverActivity);
                    });
                });
            }
        };
    }

    /**
     * This WebChatAdapter implements the sendActivities method which is called by the TurnContext class.
     * It's also possible to write a custom TurnContext with different methods of accessing an adapter.
     * @param {TurnContext} context
     * @param {Activity[]} activities
     */
    async sendActivities(context, activities) {

        const activityData = {
            channelId: 'webchat-adapter',
            conversation: { id: 'bot' },
            from: BOT_PROFILE,
            recipient: USER_PROFILE,
        };

        const sentActivities = activities.map(activity =>  ({ 
            ...activity, 
            ...activityData, 
            id: Date.now() + Math.random().toString(36), 
            timestamp: new Date().toISOString() 
        }));

        return sentActivities.map(activity => { 
            const { id } = activity;

            this.activityObserver.next(activity)
            return { id }
        });
    }

    /**
     * Registers the business logic for the adapter, it takes a handler that takes a TurnContext object as a parameter.
     * @param {function} logic The driver code of the developer's bot application. This code receives and responds to user messages.
    */
    processActivity(logic) {
        this.logic = logic;
        return this;
    }

    /**
     * Runs the bot's middleware pipeline in addition to any business logic, if `this.logic` is found.
     * @param {Activity} activity
     */
    onReceive(activity) {
        const context = new TurnContext(this, activity);

        // Runs the middleware pipeline followed by any registered business logic.
        return this.runMiddleware(context, this.logic || function() {});
    }
}

export const createDirectLine = () => {
    const memory = new MemoryStorage();
    const conversationState = new ConversationState(memory);
    const userState = new UserState(memory);

    const mockBot = new MockBot({ conversationState, userState });

    const mockBotAdapter = new WebChatAdapter();

    mockBotAdapter.processActivity(async (context) => {
        await mockBot.run(context);
    });

    return mockBotAdapter.botConnection;
}