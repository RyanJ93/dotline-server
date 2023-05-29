'use strict';

import Conversation from './Conversation.js';
import CounterModel from './CounterModel.js';
import User from './User.js';

class MessageCommitStat extends CounterModel {
    constructor() {
        super();

        this._mapping = {
            tableName: 'message_commit_stats',
            keys: ['conversation_id', 'user_id'],
            fields: {
                conversation: { name: 'conversation_id', relation: { model: Conversation, mapping: { conversation_id: { foreign: 'id', method: 'getID' } }} },
                user: { name: 'user_id', relation: { model: User, mapping: { user_id: { foreign: 'id', method: 'getID' } }} },
                commitCounter: { name: 'commit_counter', type: 'counter' }
            }
        };
    }

    setConversation(conversation){
        this._attributes.conversation = conversation;
        return this;
    }

    getConversation(){
        return this._attributes.conversation ?? null;
    }

    setUser(user){
        this._attributes.user = user;
        return this;
    }

    getUser(){
        return this._attributes.user ?? null;
    }
}

export default MessageCommitStat;
