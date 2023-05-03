'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import MessageFlagName from '../enum/MessageFlagName.js';
import Injector from '../facades/Injector.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Service from './Service.js';
import Conversation from '../models/Conversation.js';

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
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid flag. is given.
     */
    async isThereAnyFlaggedMessage(conversation, user, flag){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        if ( flag === '' || typeof flag !== 'string' ){
            throw new IllegalArgumentException('Invalid flag.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
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
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        const availableFlags = Object.values(MessageFlagName), conversation = this.#message.getConversation();
        return await this.#messageFlagRepository.getMessageFlags(conversation, user, this.#message, availableFlags);
    }

    /**
     * Associates all the given flags to the message defined for the given users.
     *
     * @param {string[]} flagList
     * @param {User[]} userList
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance list is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     */
    async addMessageFlagsForMultipleUser(flagList, userList){
        if ( !Array.isArray(flagList) ){
            throw new IllegalArgumentException('Invalid flag list.');
        }
        if ( !Array.isArray(userList) ){
            throw new IllegalArgumentException('Invalid user list.');
        }
        return await this.#messageFlagRepository.createForMultipleUsers(this.#message.getConversation(), this.#message, userList, flagList);
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
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        if ( !Array.isArray(flagList) ){
            throw new IllegalArgumentException('Invalid flag list.');
        }
        return await this.#messageFlagRepository.createMultiple(this.#message.getConversation(), this.#message, user, flagList);
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
            return this.#messageFlagRepository.getMessageFlags(conversation, member, this.#message, [flag]);
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
     * @throws {IllegalArgumentException} If an invalid user instance list is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     */
    async removeMessageFlagsForMultipleUser(flagList, userList){
        if ( !Array.isArray(flagList) ){
            throw new IllegalArgumentException('Invalid flag list.');
        }
        if ( !Array.isArray(userList) ){
            throw new IllegalArgumentException('Invalid user list.');
        }
        await this.#messageFlagRepository.removeForMultipleUsers(this.#message.getConversation(), this.#message, userList, flagList);
    }

    /**
     * Removes all the given flags from the message defined for a given user.
     *
     * @param {string[]} flagList
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     */
    async removeMessageFlagsForUser(flagList, user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        if ( !Array.isArray(flagList) ){
            throw new IllegalArgumentException('Invalid flag list.');
        }
        await this.#messageFlagRepository.removeMultiple(this.#message.getConversation(), this.#message, user, flagList);
    }

    /**
     * Removes all the flags for all messages given the conversation they belong to and the user they are referred to.
     *
     * @param {Conversation} conversation
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid Conversation instance is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async removeConversationFlagsForUser(conversation, user){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        await this.#messageFlagRepository.removeConversationFlagsForUser(conversation, user);
    }

    /**
     * Removes all the flags for all messages given the conversation they belong to and the user they are referred to.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid Conversation instance is given.
     */
    async removeConversationFlags(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        await this.#messageFlagRepository.removeConversationFlags(conversation);
    }
}

export default MessageFlagService;
