'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Conversation from '../models/Conversation.js';
import Injector from '../facades/Injector.js';
import Message from '../models/Message.js';
import Service from './Service.js';

class MessageCommitService extends Service {
    /**
     * @type {MessageCommitStatRepository}
     */
    #messageCommitStatRepository;

    /**
     * @type {MessageCommitRepository}
     */
    #messageCommitRepository;

    /**
     * @type {?Conversation}
     */
    #conversation = null;

    /**
     * @type {?Message}
     */
    #message = null;

    /**
     * The class constructor.
     *
     * @param {?Conversation} [conversation]
     * @param {?Message} [message]
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    constructor(conversation = null, message = null){
        super();

        this.#messageCommitStatRepository = Injector.inject('MessageCommitStatRepository');
        this.#messageCommitRepository = Injector.inject('MessageCommitRepository');
        this.setConversation(conversation).setMessage(message);
    }

    /**
     * Sets the conversation.
     *
     * @param {?Conversation} conversation
     *
     * @returns {MessageCommitService}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     */
    setConversation(conversation){
        if ( conversation !== null && !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        this.#conversation = conversation;
        return this;
    }

    /**
     * Returns the conversation.
     *
     * @returns {?Conversation}
     */
    getConversation(){
        return this.#conversation;
    }

    /**
     * Sets the message.
     *
     * @param {?Message} message
     *
     * @returns {MessageCommitService}
     *
     * @throws {IllegalArgumentException} If an invalid message instance is given.
     */
    setMessage(message){
        if ( message !== null && !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message instance.');
        }
        this.#message = message;
        return this;
    }

    /**
     * Returns the message.
     *
     * @returns {?Message}
     */
    getMessage(){
        return this.#message;
    }

    /**
     * Updates latest message commit.
     *
     * @param {string} action
     * @param {?User} [user]
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid action is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async commitAction(action, user = null){
        await Promise.all([
            this.#messageCommitStatRepository.incrementCounter(this.#conversation, user),
            this.#messageCommitRepository.commitAction(this.#message, action, user)
        ]);
    }

    /**
     * Drops all the message commits for all the messages within a given conversation.
     *
     * @returns {Promise<void>}
     */
    async removeMessageCommitsByConversation(){
        await Promise.all([
            this.#messageCommitRepository.removeMessageCommitsByConversation(this.#conversation),
            this.#messageCommitStatRepository.dropCounterForConversation(this.#conversation)
        ]);
        this._logger.info('Removed all the message commits for conversation ' + this.#conversation.getID());
    }

    /**
     * Returns all the message commits for the defined conversation and referred to a given user.
     *
     * @param {User} user
     * @param {number} [limit=250]
     * @param {?string} [endingMessageID]
     * @param {?string} [startingMessageID]
     *
     * @returns {Promise<MessageCommit[]>}
     *
     * @throws {IllegalArgumentException} If an invalid starting message ID is given.
     * @throws {IllegalArgumentException} If an invalid ending message ID is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid limit is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async listMessageCommits(user, limit = 250, endingMessageID = null, startingMessageID = null){
        return await this.#messageCommitRepository.getMessageCommitsByUser(this.#conversation, user, limit, endingMessageID, startingMessageID);
    }

    /**
     * Returns all the counters associated to a given user.
     *
     * @param {User} user
     *
     * @returns {Promise<MessageCommitStat[]>}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async getMessageCommitCounterList(user){
        return await this.#messageCommitStatRepository.getCounterList(user);
    }
}

export default MessageCommitService;
