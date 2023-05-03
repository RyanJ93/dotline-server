'use strict';

import Conversation from './Conversation.js';
import Message from './Message.js';
import Model from './Model.js';
import User from './User.js';

class MessageFlag extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['conversation_id', 'user_id', 'message_id', 'flag'],
            tableName: 'message_flags',
            fields: {
                message: { name: 'message_id', relation: { model: Message, mapping: { message_id: { foreign: 'id', method: 'getID' }, conversation_id: { foreign: 'conversation_id', method: 'getConversationID' } }} },
                conversation: { name: 'conversation_id', relation: { model: Conversation, mapping: { conversation_id: { foreign: 'id', method: 'getID' } }} },
                user: { name: 'user_id', relation: { model: User, mapping: { user_id: { foreign: 'id', method: 'getID' } }} },
                flag: { name: 'flag', type: 'string' }
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

    setMessage(message){
        this._attributes.message = message;
        return this;
    }

    getMessage(){
        return this._attributes.message ?? null;
    }

    setUser(user){
        this._attributes.user = user;
        return this;
    }

    getUser(){
        return this._attributes.user ?? null;
    }

    setFlag(flag){
        this._attributes.flag = flag;
        return this;
    }

    getFlag(){
        return this._attributes.flag ?? null;
    }
}

export default MessageFlag;
