'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Conversation from '../models/Conversation.js';
import Injector from '../facades/Injector.js';
import User from '../models/User.js';
import Service from './Service.js';

class ConversationStatService extends Service {
    #conversationStatRepository;
    #user = null;

    constructor(user = null){
        super();

        this.#conversationStatRepository = Injector.inject('ConversationStatRepository');
        this.setUser(user);
    }

    setUser(user){
        if ( user !== null && !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        this.#user = user;
        return this;
    }

    getUser(){
        return this.#user;
    }

    async incrementCounter(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        await this.#conversationStatRepository.incrementMessageCounter(this.#user, conversation);
    }

    async decrementCounter(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        await this.#conversationStatRepository.incrementMessageCounter(this.#user, conversation);
    }

    async deleteCounter(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        await this.#conversationStatRepository.deleteCounter(this.#user, conversation);
    }

    async getCounter(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        return await this.#conversationStatRepository.findByConversation(this.#user, conversation);
    }

    async getUserCounters(){
        return await this.#conversationStatRepository.findByUser(this.#user);
    }

    async deleteMembersCounter(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        await Promise.all(Object.keys(conversation.getMembers()).map((userID) => {
            return this.#conversationStatRepository.deleteCounter(new User().setID(userID), conversation);
        }));
    }
}

export default ConversationStatService;
