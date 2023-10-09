'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Conversation from '../models/Conversation.js';
import RedisRepository from './RedisRepository.js';
import Injector from '../facades/Injector.js';
import User from '../models/User.js';

class UserConversationStatusRepository extends RedisRepository {
    /**
     * Sets current user status, such as "typing".
     *
     * @param {Conversation} conversation
     * @param {User} user
     * @param {string} status
     * @param {number} [ttl=5]
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid TTL value is given.
     * @throws {IllegalArgumentException} If an invalid status is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async setStatus(conversation, user, status, ttl = 5){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( status === '' || typeof status !== 'string' ){
            throw new IllegalArgumentException('Invalid status.');
        }
        if ( ttl === null || isNaN(ttl) || ttl <= 0 ){
            throw new IllegalArgumentException('Invalid TTL value.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        const key = conversation.getID() + '@' + user.getID();
        await Injector.inject('redis').set(key, status, 'NX', ttl);
    }
}

export default UserConversationStatusRepository;
