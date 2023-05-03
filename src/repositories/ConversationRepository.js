'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import HMACSigningParameters from '../DTOs/HMACSigningParameters.js';
import AESStaticParameters from '../DTOs/AESStaticParameters.js';
import CassandraRepository from './CassandraRepository.js';
import Conversation from '../models/Conversation.js';
import cassandra from 'cassandra-driver';
import User from '../models/User.js';

class ConversationRepository extends CassandraRepository {
    /**
     * Returns all the conversations containing the given users as members.
     *
     * @param {string[]} userIDList
     *
     * @returns {Promise<Conversation[]>}
     *
     * @throws {IllegalArgumentException} If an invalid list of user IDs is given.
     */
    async getConversationListByMembers(userIDList){
        if ( !Array.isArray(userIDList) ){
            throw new IllegalArgumentException('Invalid list of user IDs.');
        }
        const memberIDList = userIDList.map((user) => user.toString());
        return await Conversation.find({
            members: { $containsKey: memberIDList }
        }, { allowFiltering: true });
    }

    /**
     * Returns all the conversations where the given user is a member.
     *
     * @param {User} user
     *
     * @returns {Promise<Conversation[]>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async getUserConversationList(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        return await Conversation.find({
            members: { $containsKey: user.getID().toString() }
        }, { allowFiltering: true });
    }

    /**
     * Returns the conversation matching the given ID.
     *
     * @param {string} id
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an id is given.
     */
    async findByID(id){
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid id.');
        }
        return await Conversation.findOne({ id: id });
    }

    /**
     * Creates a new conversation.
     *
     * @param {AESStaticParameters} encryptionParameters
     * @param {HMACSigningParameters} signingParameters
     * @param {ConversationMemberPlaceholder[]} conversationMemberPlaceholderList
     * @param {?string} name
     *
     * @returns {Promise<Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation member placeholder list is given.
     * @throws {IllegalArgumentException} If an invalid encryption parameters instance is given.
     * @throws {IllegalArgumentException} If an invalid signing parameters instance list is given.
     * @throws {IllegalArgumentException} If an invalid name list is given.
     */
    async create(encryptionParameters, signingParameters, conversationMemberPlaceholderList, name = null){
        if ( !Array.isArray(conversationMemberPlaceholderList) ){
            throw new IllegalArgumentException('Invalid conversation member placeholder list.');
        }
        if ( !( encryptionParameters instanceof AESStaticParameters ) ){
            throw new IllegalArgumentException('Invalid encryption parameters instance.');
        }
        if ( !( signingParameters instanceof HMACSigningParameters ) ){
            throw new IllegalArgumentException('Invalid signing parameters instance.');
        }
        if ( name !== null && ( name === '' || typeof name !== 'string' ) ){
            throw new IllegalArgumentException('Invalid name.');
        }
        const conversation = new Conversation(), members = {};
        conversationMemberPlaceholderList.forEach((member) => {
            members[member.getUserID()] = {
                encryption_key: member.getEncryptionKey(),
                signing_key: member.getSigningKey(),
                deleted_at: null
            };
        });
        conversation.setEncryptionParameters(encryptionParameters);
        conversation.setSigningParameters(signingParameters);
        conversation.setID(cassandra.types.TimeUuid.now());
        conversation.setMembers(members);
        conversation.setName(name);
        await conversation.save();
        return conversation;
    }

    /**
     * Removes a member from a given conversation.
     *
     * @param {Conversation} conversation
     * @param {User} user
     * @param {boolean} [softDelete=true]
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async deleteMember(conversation, user, softDelete = true){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        if ( softDelete === false ){
            delete conversation.getMembers()[user.getID()];
        }else{
            conversation.getMembers()[user.getID()].deleted_at = new Date();
        }
        await conversation.save();
    }

    /**
     * Deletes a given conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     */
    async delete(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        await conversation.delete();
    }

    /**
     * Restores all the conversation's members.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     */
    async restoreConversationMembers(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        const members = conversation.getMembers();
        for ( const userID in members ){
            members[userID].deleted_at = null;
        }
        await conversation.save();
    }
}

export default ConversationRepository;
