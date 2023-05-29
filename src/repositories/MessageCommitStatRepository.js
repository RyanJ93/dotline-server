'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import MessageCommitStat from '../models/MessageCommitStat.js';
import CassandraRepository from './CassandraRepository.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

class MessageCommitStatRepository extends CassandraRepository {
    /**
     * Generates an instance of the MessageCommitStat model.
     *
     * @param {Conversation} conversation
     * @param {User} user
     *
     * @returns {MessageCommitStat}
     */
    #makeModelInstance(conversation, user){
        const messageCommitStat = new MessageCommitStat();
        messageCommitStat.setConversation(conversation);
        messageCommitStat.setUser(user);
        return messageCommitStat;
    }

    /**
     * Increments commit counter for a given conversation and user.
     *
     * @param {Conversation} conversation
     * @param {?User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async incrementCounter(conversation, user){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( user !== null && !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        const userList = user === null ? Object.keys(conversation.getMembers()).map((userID) => new User().setID(userID)) : [user];
        await Promise.all(userList.map((user) => this.#makeModelInstance(conversation, user).increment('commitCounter')));
    }

    /**
     * Drops a counter associated to a given conversation and user.
     *
     * @param {Conversation} conversation
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async dropCounter(conversation, user){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        await MessageCommitStat.findAndDelete({
            conversation: conversation.getID(),
            user: user.getID()
        });
    }

    /**
     * Removes all the counters associated to a given conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async dropCounterForConversation(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        await MessageCommitStat.findAndDelete({
            conversation: conversation.getID()
        });
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
    async getCounterList(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        return await MessageCommitStat.find({
            user: user.getID()
        }, { allowFiltering: true }, ['conversation', 'user']);
    }
}

export default MessageCommitStatRepository;
