'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Conversation from '../models/Conversation.js';
import Injector from '../facades/Injector.js';
import User from '../models/User.js';
import Service from './Service.js';

class ConversationStatService extends Service {
    /**
     * @type {ConversationStatRepository}
     */
    #conversationStatRepository;

    /**
     * @type {?User}
     */
    #user = null;

    /**
     * The class constructor.
     *
     * @param {?User} [user]
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    constructor(user = null){
        super();

        this.#conversationStatRepository = Injector.inject('ConversationStatRepository');
        this.setUser(user);
    }

    /**
     * Sets the user.
     *
     * @param {?User} user
     *
     * @returns {ConversationStatService}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    setUser(user){
        if ( user !== null && !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        this.#user = user;
        return this;
    }

    /**
     * Returns the user.
     *
     * @returns {?User}
     */
    getUser(){
        return this.#user;
    }

    /**
     * Increments the message counter for the given conversation and the defined user.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async incrementCounter(conversation){
        await this.#conversationStatRepository.incrementMessageCounter(this.#user, conversation);
    }

    /**
     * Decrements the message counter for the given conversation and the defined user.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async decrementCounter(conversation){
        await this.#conversationStatRepository.decrementMessageCounter(this.#user, conversation);
    }

    /**
     * Removes the message counter associated to a given conversation and user.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async deleteCounter(conversation){
        await this.#conversationStatRepository.deleteCounter(this.#user, conversation);
        this._logger.info('Deleted message counter for conversation ' + conversation.getID() + ' and user ' + this.#user.getID());
    }

    /**
     * Returns the stats related to a given conversation and user.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<?ConversationStat>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async getCounter(conversation){
        return await this.#conversationStatRepository.findByConversation(this.#user, conversation);
    }

    /**
     * Returns all the stats for all the conversations the defined user is involved in.
     *
     * @returns {Promise<ConversationStat[]>}
     */
    async getUserCounters(){
        return await this.#conversationStatRepository.findByUser(this.#user);
    }

    /**
     * Removes the counter for every member involved in a given conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async deleteMembersCounter(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        this._logger.debug('Removing message counters for every member of the conversation ' + conversation.getID() + '...');
        await Promise.all(Object.keys(conversation.getMembers()).map((userID) => {
            this._logger.debug('Removing message counters for member ' + userID + ' in conversation ' + conversation.getID());
            return this.#conversationStatRepository.deleteCounter(new User().setID(userID), conversation);
        }));
        this._logger.info('Removed message counters for every member of the conversation ' + conversation.getID());
    }
}

export default ConversationStatService;
