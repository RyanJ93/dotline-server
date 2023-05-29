'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import CassandraRepository from './CassandraRepository.js';
import MessageCommit from '../models/MessageCommit.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import cassandra from 'cassandra-driver';
import User from '../models/User.js';

class MessageCommitRepository extends CassandraRepository {
    /**
     * Removes all the commits for a given message and user.
     *
     * @param {Message} message
     * @param {User} user
     *
     * @returns {Promise<void>}
     */
    async #dropOlderMessageCommits(message, user){
        const messageCommitList = await MessageCommit.find({
            conversation: message.getConversation().getID(),
            message: message.getID(),
            user: user.getID()
        }, {}, ['user', 'conversation', 'message']);
        if ( messageCommitList.length > 0 ){
            await Promise.all(messageCommitList.map((messageCommit) => {
                return MessageCommit.findAndDelete({
                    conversation: message.getConversation().getID(),
                    id: messageCommit.getID(),
                    user: user.getID()
                });
            }));
        }
    }

    /**
     * Creates a new message commit.
     *
     * @param {Message} message
     * @param {string} action
     * @param {?User} user
     *
     * @returns {Promise<void>}
     */
    async #createMessageCommit(message, action, user){
        await this.#dropOlderMessageCommits(message, user);
        const messageCommit = new MessageCommit();
        messageCommit.setID(MessageCommitRepository.generateTimeUUID());
        messageCommit.setConversation(message.getConversation());
        messageCommit.setMessage(message);
        messageCommit.setDate(new Date());
        messageCommit.setAction(action);
        messageCommit.setUser(user);
        await messageCommit.save();
    }

    /**
     * Updates latest message commit.
     *
     * @param {Message} message
     * @param {string} action
     * @param {?User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid message is given.
     * @throws {IllegalArgumentException} If an invalid action is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async commitAction(message, action, user){
        if ( user !== null && !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        if ( action === '' || typeof action !== 'string' ){
            throw new IllegalArgumentException('Invalid action.');
        }
        if ( !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message.');
        }
        const userIDList = Object.keys(message.getConversation().getMembers());
        const userList = user === null ? userIDList.map((userID) => new User().setID(userID)) : [user];
        await Promise.all(userList.map((user) => this.#createMessageCommit(message, action, user)));
    }

    /**
     * Returns all the message commits for a given conversation and referred to a given user.
     *
     * @param {Conversation} conversation
     * @param {User} user
     * @param {number} [limit=250]
     * @param {?string} [endingID]
     * @param {?string} [startingID]
     *
     * @returns {Promise<MessageCommit[]>}
     *
     * @throws {IllegalArgumentException} If an invalid starting message commit ID is given.
     * @throws {IllegalArgumentException} If an invalid ending message commit ID is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid limit is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async getMessageCommitsByUser(conversation, user, limit = 250, endingID = null, startingID = null){
        if ( startingID !== null && ( startingID === '' || typeof startingID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid starting message commit ID.');
        }
        if ( endingID !== null && ( endingID === '' || typeof endingID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid ending message commit ID.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        if ( isNaN(limit) || limit <= 0 ){
            throw new IllegalArgumentException('Invalid limit.');
        }
        const filters = { conversation: conversation.getID(), user: user.getID(), id: {} };
        if ( typeof startingID === 'string' ){
            Object.assign(filters.id, { $lt: cassandra.types.TimeUuid.fromString(startingID) });
        }
        if ( typeof endingID === 'string' ){
            Object.assign(filters.id, { $gt: cassandra.types.TimeUuid.fromString(endingID) });
        }
        return await MessageCommit.find(filters, {
            orderByDesc: 'id',
            limit: limit
        }, ['conversation', 'user']);
    }

    /**
     * Drops all the message commits for all the messages within a given conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async removeMessageCommitsByConversation(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        await MessageCommit.findAndDelete({ conversation: conversation.getID() });
    }
}

export default MessageCommitRepository;
