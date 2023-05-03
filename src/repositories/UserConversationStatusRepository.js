'use strict';

import RedisRepository from './RedisRepository.js';
import Injector from '../facades/Injector.js';

class UserConversationStatusRepository extends RedisRepository {
    async setStatus(conversation, user, status, ttl = 5){
        const key = conversation.getID() + '@' + user.getID();
        await Injector.inject('redis').set(key, status, 'NX', ttl);
    }
}

export default UserConversationStatusRepository;
