'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import MessageFlagName from '../enum/MessageFlagName.js';
import Conversation from '../models/Conversation.js';
import MessageFlag from '../models/MessageFlag.js';
import Database from '../facades/Database.js';
import Message from '../models/Message.js';
import Repository from './Repository.js';
import User from '../models/User.js';

class MessageFlagRepository extends Repository {
    /**
     * Generates an instance of the MessageFlag model.
     *
     * @param {Conversation} conversation
     * @param {User} user
     * @param {Message} message
     * @param {string} flag
     *
     * @returns {MessageFlag}
     */
    #makeModelInstance(conversation, user, message, flag){
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
     */
    async createForMultipleUsers(conversation, message, userList, flagList){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        if ( !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        if ( !Array.isArray(flagList) ){
            throw new IllegalArgumentException('Invalid flag list.');
        }
        if ( !Array.isArray(userList) ){
            throw new IllegalArgumentException('Invalid user list.');
        }
        const queries = [];
        userList.forEach((user) => {
            flagList.forEach((flag) => {
                const messageFlag = this.#makeModelInstance(conversation, user, message, flag);
                queries.push(messageFlag.getStorageParams());
            });
        });
        await Database.batch(queries);
    }

    async createMultiple(conversation, message, user, flagList){
        await Database.batch(flagList.forEach((flag) => {
            const messageFlag = this.#makeModelInstance(conversation, user, message, flag);
            return messageFlag.getStorageParams();
        }));
    }

    async create(conversation, user, message, flag){
        const messageFlag = this.#makeModelInstance(conversation, user, message, flag);
        await messageFlag.save();
        return messageFlag;
    }

    async getMessageFlags(conversation, user, message, flagList){
        return await MessageFlag.find({
            conversation: conversation.getID(),
            message: message.getID(),
            user: user.getID(),
            flag: flagList
        });
    }

    async removeForMultipleUsers(conversation, message, userList, flagList){
        await Promise.all(userList.map((user) => {
            return MessageFlag.findAndDelete({
                conversation: conversation.getID(),
                message: message.getID(),
                user: user.getID(),
                flag: flagList
            });
        }));
    }

    async removeMultiple(conversation, user, message, flagList){
        await MessageFlag.findAndDelete({
            conversation: conversation.getID(),
            message: message.getID(),
            user: user.getID(),
            flag: flagList
        });
    }

    async removeConversationFlagsForUser(conversation, user){
        await MessageFlag.findAndDelete({
            conversation: conversation.getID(),
            user: user.getID()
        });
    }

    async removeConversationFlags(conversation){
        await MessageFlag.findAndDelete({ conversation: conversation.getID() });
    }
}

export default MessageFlagRepository;
