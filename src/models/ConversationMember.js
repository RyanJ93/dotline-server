'use strict';

import Conversation from './Conversation.js';
import Model from './Model.js';
import User from './User.js';

class ConversationMember extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['conversation_id', 'user_id'],
            tableName: 'conversation_members',
            fields: {
                conversation: { name: 'conversation_id', relation: { model: Conversation, mapping: { conversation_id: { foreign: 'id', method: 'getID' } }} },
                user: { name: 'user_id', relation: { model: User, mapping: { user_id: { foreign: 'id', method: 'getID' } }} },
                encryptionKey: { name: 'encryption_key', type: 'string' }
            }
        };
    }

    setEncryptionKey(encryptionKey){
        this._attributes.encryptionKey = encryptionKey;
        return this;
    }

    getEncryptionKey(){
        return this._attributes.encryptionKey ?? null;
    }

    setConversation(conversation){
        this._attributes.conversation = conversation;
        return this;
    }

    getConversationID(){
        return this._attributes._originalsReceived.conversation_id ?? null;
    }

    getConversation(){
        return this._attributes.conversation ?? null;
    }

    setUser(user){
        this._attributes.user = user;
        return this;
    }

    getUserID(){
        return this._attributes._originalsReceived.user_id ?? null;
    }

    getUser(){
        return this._attributes.user ?? null;
    }
}

export default ConversationMember;
