'use strict';

import Conversation from './Conversation.js';
import Model from './Model.js';
import User from './User.js';

class Message extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['conversation_id', 'id'],
            tableName: 'messages',
            fields: {
                conversation: { name: 'conversation_id', relation: { model: Conversation, mapping: { conversation_id: { foreign: 'id', method: 'getID' } }} },
                user: { name: 'user_id', relation: { model: User, mapping: { user_id: { foreign: 'id', method: 'getID' } }} },
                encryptionIV: { name: 'encryption_iv', type: 'string' },
                signature: { name: 'signature', type: 'string' },
                isEdited: { name: 'is_edited', type: 'boolean' },
                createdAt: { name: 'created_at', type: 'date' },
                updatedAt: { name: 'updated_at', type: 'date' },
                content: { name: 'content', type: 'string' },
                type: { name: 'type', type: 'string' },
                id: { name: 'id', type: 'string' }
            }
        };
    }

    setEncryptionIV(encryptionIV){
        this._attributes.encryptionIV = encryptionIV;
        return this;
    }

    getEncryptionIV(){
        return this._attributes.encryptionIV ?? null;
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

    setSignature(signature){
        this._attributes.signature = signature;
        return this;
    }

    getSignature(){
        return this._attributes.signature ?? null;
    }

    setIsEdited(isEdited){
        this._attributes.isEdited = isEdited;
        return this;
    }

    getIsEdited(){
        return this._attributes.isEdited ?? null;
    }

    setCreatedAt(createdAt){
        this._attributes.createdAt = createdAt;
        return this;
    }

    getCreatedAt(){
        return this._attributes.createdAt ?? null;
    }

    setUpdatedAt(updatedAt){
        this._attributes.updatedAt = updatedAt;
        return this;
    }

    getUpdatedAt(){
        return this._attributes.updatedAt ?? null;
    }

    setContent(content){
        this._attributes.content = content;
        return this;
    }

    getContent(){
        return this._attributes.content ?? null;
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

    setType(type){
        this._attributes.type = type;
        return this;
    }

    getType(){
        return this._attributes.type ?? null;
    }

    setID(id){
        this._attributes.id = id;
        return this;
    }

    getID(){
        return this._attributes.id ?? null;
    }
}

export default Message;
