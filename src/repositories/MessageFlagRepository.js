'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Conversation from '../models/Conversation.js';
import MessageFlag from '../models/MessageFlag.js';
import Database from '../facades/Database.js';
import Message from '../models/Message.js';
import Repository from './Repository.js';
import User from '../models/User.js';

class MessageFlagRepository extends Repository {
    /**
     * Validates the given conversation, message and user.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User} user
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    static #validateBasicParameters(conversation, message, user){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
    }

    /**
     * Validates the given conversation, message and user and a given flag list.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User} user
     * @param {string[]} flagList
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    static #validateFlagListParameters(conversation, message, user, flagList){
        MessageFlagRepository.#validateBasicParameters(conversation, message, user);
        if ( !Array.isArray(flagList) ){
            throw new IllegalArgumentException('Invalid flag list.');
        }
    }

    /**
     * Validates the given conversation, message and a given user/flag list.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User[]} userList
     * @param {string[]} flagList
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid user list is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    static #validateFlagAndUserListParameters(conversation, message, userList, flagList){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message.');
        }
        if ( !Array.isArray(flagList) ){
            throw new IllegalArgumentException('Invalid flag list.');
        }
        if ( !Array.isArray(userList) ){
            throw new IllegalArgumentException('Invalid user list.');
        }
    }

    /**
     * Generates an instance of the MessageFlag model.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User} user
     * @param {string} flag
     *
     * @returns {MessageFlag}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     * @throws {IllegalArgumentException} If an invalid flag is given.
     */
    #makeModelInstance(conversation, message, user, flag){
        MessageFlagRepository.#validateBasicParameters(conversation, message, user);
        if ( flag === '' || typeof flag !== 'string' ){
            throw new IllegalArgumentException('Invalid flag.');
        }
        const messageFlag = new MessageFlag();
        messageFlag.setConversation(conversation);
        messageFlag.setMessage(message);
        messageFlag.setUser(user);
        messageFlag.setFlag(flag);
        return messageFlag;
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
     * @throws {IllegalArgumentException} If an invalid flag is given.
     */
    async isThereAnyFlaggedMessage(conversation, user, flag){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( flag === '' || typeof flag !== 'string' ){
            throw new IllegalArgumentException('Invalid flag.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        const messageFlag = await MessageFlag.findOne({
            conversation: conversation.getID(),
            user: user.getID(),
            flag: flag
        });
        return messageFlag === null;
    }

    /**
     * Associates all the given flags to the given message for the given users.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User[]} userList
     * @param {string[]} flagList
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user list is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    async createForMultipleUsers(conversation, message, userList, flagList){
        MessageFlagRepository.#validateFlagAndUserListParameters(conversation, message, userList, flagList);
        const queries = [];
        userList.forEach((user) => {
            flagList.forEach((flag) => {
                const messageFlag = this.#makeModelInstance(conversation, message, user, flag);
                queries.push(messageFlag.getStorageParams());
            });
        });
        await Database.batch(queries);
    }

    /**
     * Creates multiple flags for a given user, message and conversation.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User} user
     * @param {string[]} flagList
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async createMultiple(conversation, message, user, flagList){
        MessageFlagRepository.#validateFlagListParameters(conversation, message, user, flagList);
        await Database.batch(flagList.forEach((flag) => {
            const messageFlag = this.#makeModelInstance(conversation, message, user, flag);
            return messageFlag.getStorageParams();
        }));
    }

    /**
     * Creates a new flag for the given user, message and conversation.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User} user
     * @param {string} flag
     *
     * @returns {Promise<MessageFlag>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     * @throws {IllegalArgumentException} If an invalid flag is given.
     */
    async create(conversation, message, user, flag){
        const messageFlag = this.#makeModelInstance(conversation, message, user, flag);
        await messageFlag.save();
        return messageFlag;
    }

    /**
     * Returns all the flags included in a given flag list for a given conversation, message and user.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User} user
     * @param {string[]} flagList
     *
     * @returns {Promise<MessageFlag[]>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async getMessageFlags(conversation, message, user, flagList){
        MessageFlagRepository.#validateFlagListParameters(conversation, message, user, flagList);
        return await MessageFlag.find({
            conversation: conversation.getID(),
            message: message.getID(),
            user: user.getID(),
            flag: flagList
        });
    }

    /**
     * Removes a given list of flags for every given user within a given message and conversation.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User[]} userList
     * @param {string[]} flagList
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user list is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    async removeForMultipleUsers(conversation, message, userList, flagList){
        MessageFlagRepository.#validateFlagAndUserListParameters(conversation, message, userList, flagList);
        await Promise.all(userList.map((user) => {
            return MessageFlag.findAndDelete({
                conversation: conversation.getID(),
                message: message.getID(),
                user: user.getID(),
                flag: flagList
            });
        }));
    }

    /**
     * Removes a given list of flags for the given user within the given message and conversation.
     *
     * @param {Conversation} conversation
     * @param {Message} message
     * @param {User} user
     * @param {string[]} flagList
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid flag list is given.
     * @throws {IllegalArgumentException} If an invalid message is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async removeMultiple(conversation, message, user, flagList){
        MessageFlagRepository.#validateFlagListParameters(conversation, message, user, flagList);
        await MessageFlag.findAndDelete({
            conversation: conversation.getID(),
            message: message.getID(),
            user: user.getID(),
            flag: flagList
        });
    }

    /**
     * Removes all the flags for every message in the given conversation for a given user.
     *
     * @param {Conversation} conversation
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async removeConversationFlagsForUser(conversation, user){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        await MessageFlag.findAndDelete({
            conversation: conversation.getID(),
            user: user.getID()
        });
    }

    /**
     * Removes all the flags for every user and message in a given conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async removeConversationFlags(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        await MessageFlag.findAndDelete({ conversation: conversation.getID() });
    }
}

export default MessageFlagRepository;
