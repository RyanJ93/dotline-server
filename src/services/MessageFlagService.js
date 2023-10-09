'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import MessageFlagName from '../enum/MessageFlagName.js';
import Injector from '../facades/Injector.js';
import Message from '../models/Message.js';
import Logger from '../facades/Logger.js';
import App from '../facades/App.js';
import Service from './Service.js';

class MessageFlagService extends Service {
    /**
     * @type {MessageFlagRepository}
     */
    #messageFlagRepository;

    /**
     * @type {?Message}
     */
    #message = null;

    /**
     * The class constructor.
     *
     * @param {?Message} [message]
     */
    constructor(message = null){
        super();

        this.#messageFlagRepository = Injector.inject('MessageFlagRepository');
        this.setMessage(message);
    }

    /**
     * Sets the message.
     *
     * @param {?Message} message
     *
     * @returns {MessageFlagService}
     *
     * @throws {IllegalArgumentException} If an invalid message instance is given.
     */
    setMessage(message){
        if ( message !== null && !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message exception.');
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
     * Checks if there's at least one message having the given flag assigned for the given user within the given conversation.
     *
     * @param {Conversation} conversation
     * @param {User} user
     * @param {string} flag
     *
     * @returns {Promise<boolean>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     * @throws {IllegalArgumentException} If an invalid flag is given.
     */
    async isThereAnyFlaggedMessage(conversation, user, flag){
        return await this.#messageFlagRepository.isThereAnyFlaggedMessage(conversation, user, flag);
    }

    /**
     * Returns all the flags associated to the message defined for a given user.
     *
     * @param {User} user
     *
     * @returns {Promise<MessageFlag[]>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async getMessageFlags(user){
        const availableFlags = Object.values(MessageFlagName), conversation = this.#message.getConversation();
        return await this.#messageFlagRepository.getMessageFlags(conversation, this.#message, user, availableFlags);
    }

    /**
     * Associates all the given flags to the message defined for the given users.
     *
     * @param {string[]} flagList
     * @param {User[]} userList
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid user list is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     */
    async addMessageFlagsForMultipleUser(flagList, userList){
        await this.#messageFlagRepository.createForMultipleUsers(this.#message.getConversation(), this.#message, userList, flagList);
        if ( App.getDebug() === true ){
            let message = 'Added message flags (' + flagList.join(', ') + ') to message ' + this.#message.getID() + ' in conversation ';
            message += this.#message.getConversation().getID() + ' for those users: ' + userList.map((user) => user.getID()).join(', ');
            Logger.getLogger().debug(message);
        }
    }

    /**
     * Associates all the given flags to the message defined for a given user.
     *
     * @param {string[]} flagList
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     */
    async addMessageFlagsForUser(flagList, user){
        await this.#messageFlagRepository.createMultiple(this.#message.getConversation(), this.#message, user, flagList);
        const message = 'Added message flags (' + flagList.join(', ') + ') to message ' + this.#message.getID() + ' in conversation ';
        Logger.getLogger().debug(message + this.#message.getConversation().getID() + ' for user: ' + user.getID());
    }

    /**
     * Checks if a given flag has been assigned to the defined message for all the conversation's members.
     *
     * @param {string} flag
     *
     * @returns {Promise<boolean>}
     *
     * @throws {IllegalArgumentException} If an invalid flag is given.
     */
    async isFlaggedForEveryMember(flag){
        if ( flag === '' || typeof flag !== 'string' ){
            throw new IllegalArgumentException('Invalid flag.');
        }
        const conversation = this.#message.getConversation(), results = await Promise.all(conversation.getMembers().forEach((member) => {
            return this.#messageFlagRepository.getMessageFlags(conversation, this.#message, member, [flag]);
        }));
        let isFlaggedForEveryMember = true, i = 0;
        while ( isFlaggedForEveryMember && i < results.length ){
            isFlaggedForEveryMember = results[i].length > 0;
            i++;
        }
        return isFlaggedForEveryMember;
    }

    /**
     * Removes all the given flags from the message defined for all the given users.
     *
     * @param {string[]} flagList
     * @param {User[]} userList
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async removeMessageFlagsForMultipleUser(flagList, userList){
        await this.#messageFlagRepository.removeForMultipleUsers(this.#message.getConversation(), this.#message, userList, flagList);
        if ( App.getDebug() === true ){
            const userIDs = userList.map((user) => user.getID()).join(', '), flags = flagList.join(', ');
            this._logger.debug('Removed flags (' + flags + ') for users ' + userIDs);
        }
    }

    /**
     * Removes all the given flags from the message defined for a given user.
     *
     * @param {string[]} flagList
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async removeMessageFlagsForUser(flagList, user){
        await this.#messageFlagRepository.removeMultiple(this.#message.getConversation(), this.#message, user, flagList);
        this._logger.debug('Removed flags (' + flagList.join(', ') + ') for user ' + user.getID());
    }

    /**
     * Removes all the flags for all messages given the conversation they belong to and the user they are referred to.
     *
     * @param {Conversation} conversation
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid Conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async removeConversationFlagsForUser(conversation, user){
        await this.#messageFlagRepository.removeConversationFlagsForUser(conversation, user);
        this._logger.debug('Removed flags in conversation ' + conversation.getID() + ' for user ' + user.getID());
    }

    /**
     * Removes all the flags for all messages given the conversation they belong to and the user they are referred to.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid Conversation is given.
     */
    async removeConversationFlags(conversation){
        await this.#messageFlagRepository.removeConversationFlags(conversation);
        this._logger.debug('Removed every flag in conversation ' + conversation.getID());
    }
}

export default MessageFlagService;
