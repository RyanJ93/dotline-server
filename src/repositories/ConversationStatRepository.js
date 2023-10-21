'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import ConversationStat from '../models/ConversationStat.js';
import CassandraRepository from './CassandraRepository.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

class ConversationStatRepository extends CassandraRepository {
    /**
     * Generates a new conversation stat model instance related to the given conversation and user.
     *
     * @param {User} user
     * @param {Conversation} conversation
     *
     * @returns {ConversationStat}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    #makeModelInstance(user, conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        const conversationStat = new ConversationStat();
        conversationStat.setConversation(conversation);
        conversationStat.setUser(user);
        return conversationStat;
    }

    /**
     * Increments the message counter for the given conversation and the defined user.
     *
     * @param {User} user
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async incrementMessageCounter(user, conversation){
        await this.#makeModelInstance(user, conversation).increment('messageCounter');
    }

    /**
     * Decrements the message counter for the given conversation and the defined user.
     *
     * @param {User} user
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async decrementMessageCounter(user, conversation){
        await this.#makeModelInstance(user, conversation).increment('messageCounter');
    }

    /**
     * Removes the message counter associated to a given conversation and user.
     *
     * @param {User} user
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async deleteCounter(user, conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        await ConversationStat.findAndDelete({
            conversation: conversation.getID(),
            user: user.getID()
        });
    }

    /**
     * Returns the stats related to a given conversation and user.
     *
     * @param {User} user
     * @param {Conversation} conversation
     *
     * @returns {Promise<?ConversationStat>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async findByConversation(user, conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        return await ConversationStat.find({
            conversation: conversation.getID(),
            user: user.getID()
        }, null, ['user', 'conversation']);
    }

    /**
     * Returns all the stats for all the conversations the given user is involved in.
     *
     * @param {User} user
     *
     * @returns {Promise<ConversationStat[]>}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async findByUser(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        return await ConversationStat.find({
            user: user.getID()
        }, null, ['user', 'conversation']);
    }
}

export default ConversationStatRepository;
