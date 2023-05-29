'use strict';

import Conversation from './Conversation.js';
import Message from './Message.js';
import Model from './Model.js';
import User from './User.js';

class MessageCommit extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['conversation_id', 'user_id', 'id'],
            tableName: 'message_commits',
            fields: {
                message: { name: 'message_id', relation: { model: Message, mapping: { message_id: { foreign: 'id', method: 'getID' }, conversation_id: { foreign: 'conversation_id', method: 'getConversationID' } }} },
                conversation: { name: 'conversation_id', relation: { model: Conversation, mapping: { conversation_id: { foreign: 'id', method: 'getID' } }} },
                user: { name: 'user_id', relation: { model: User, mapping: { user_id: { foreign: 'id', method: 'getID' } }} },
                action: { name: 'action', type: 'string' },
                date: { name: 'date', type: 'timestamp' },
                id: { name: 'id', type: 'timeuuid' }
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

    setAction(action){
        this._attributes.action = action;
        return this;
    }

    getAction(){
        return this._attributes.action ?? null;
    }

    setDate(date){
        this._attributes.date = date;
        return this;
    }

    getDate(){
        return this._attributes.date ?? null;
    }

    setID(id){
        this._attributes.id = id;
        return this;
    }

    getID(){
        return this._attributes.id ?? null;
    }

    toJSON(){
        const JSONObject = super.toJSON();
        JSONObject.messageID = this._attributes._originalsReceived.message_id;
        return JSONObject;
    }
}

export default MessageCommit;
