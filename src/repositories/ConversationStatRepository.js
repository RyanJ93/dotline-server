'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import ConversationStat from '../models/ConversationStat.js';
import CassandraRepository from './CassandraRepository.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

class ConversationStatRepository extends CassandraRepository {
    /**
     *
     *
     * @param {User} user
     * @param {Conversation} conversation
     *
     * @returns {ConversationStat}
     */
    #makeModelInstance(user, conversation){
        const conversationStat = new ConversationStat();
        conversationStat.setConversation(conversation);
        conversationStat.setUser(user);
        return conversationStat;
    }

    /**
     *
     *
     * @param {User} user
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     */
    async incrementMessageCounter(user, conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        await this.#makeModelInstance(user, conversation).increment('messageCounter');
    }

    async decrementMessageCounter(user, conversation){
        await this.#makeModelInstance(user, conversation).increment('messageCounter');
    }

    async deleteCounter(user, conversation){
        await ConversationStat.findAndDelete({
            conversation: conversation.getID(),
            user: user.getID()
        });
    }

    async findByConversation(user, conversation){
        return await ConversationStat.find({
            conversation: conversation.getID(),
            user: user.getID()
        }, null, ['user', 'conversation']);
    }

    async findByUser(user){
        return await ConversationStat.find({
            user: user.getID()
        }, null, ['user', 'conversation']);
    }
}

export default ConversationStatRepository;
