'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import EntityNotFoundException from '../exceptions/EntityNotFoundException.js';
import HMACSigningParameters from '../DTOs/HMACSigningParameters.js';
import ConversationStatService from './ConversationStatService.js';
import AESStaticParameters from '../DTOs/AESStaticParameters.js';
import ConversationMember from '../DTOs/ConversationMember.js';
import MessageFlagService from './MessageFlagService.js';
import MessageFlagName from '../enum/MessageFlagName.js';
import Conversation from '../models/Conversation.js';
import MessageService from './MessageService.js';
import Injector from '../facades/Injector.js';
import UserService from './UserService.js';
import cassandra from 'cassandra-driver';
import User from '../models/User.js';
import Service from './Service.js';

class ConversationService extends Service {
    /**
     * Generates an instance of this class based on the given entity identifiers.
     *
     * @param {string} conversationID
     * @param {?User} [user]
     *
     * @returns {Promise<ConversationService>}
     *
     * @throws {EntityNotFoundException} If no conversation matching the given ID is found.
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    static async makeFromEntity(conversationID, user = null){
        const conversationService = new ConversationService();
        await conversationService.getConversationByID(conversationID, user);
        if ( conversationService.getConversation() === null ){
            throw new EntityNotFoundException('No conversation matching the given ID found.');
        }
        return conversationService;
    }

    /**
     * @type {UserConversationStatusRepository}
     */
    #userConversationStatusRepository;

    /**
     * @type {ConversationRepository}
     */
    #conversationRepository;

    /**
     * @type {?Conversation}
     */
    #conversation = null;

    /**
     * Converts the objects representing the conversation members into DTO instances.
     *
     * @param {Conversation} conversation
     * @param {User} authenticatedUser
     *
     * @returns {Promise<void>}
     */
    async #processConversationMembers(conversation, authenticatedUser){
        const members = conversation.getMembers(), authenticatedUserID = authenticatedUser.getID().toString();
        // Extract a list of every conversation member's user ID and then fetch corresponding user from the database.
        const userIDList = Object.keys(members).map((userID) => cassandra.types.TimeUuid.fromString(userID));
        const userList = await new UserService().findMultipleUsers(userIDList);
        const processedMemberList = userList.map((user) => {
            // Don't expose member's encryption and signing key if that's not the authenticated user.
            const conversationMemberProps = { encryptionKey: null, signingKey: null, user: user };
            const currentUserID = user.getID().toString();
            conversationMemberProps.deletedAt = members[currentUserID].deleted_at ?? null;
            if ( currentUserID === authenticatedUserID ){
                conversationMemberProps.encryptionKey = members[currentUserID].encryption_key;
                conversationMemberProps.signingKey = members[currentUserID].signing_key;
            }
            return new ConversationMember(conversationMemberProps);
        });
        conversation.addVirtualAttribute('members', processedMemberList);
    }

    /**
     * Adds some additional attributes to the conversation.
     *
     * @param {Conversation} conversation
     * @param {User} user
     *
     * @returns {Promise<void>}
     */
    async #processConversationAdditionalProperties(conversation, user){
        const isUnread = await new MessageFlagService().isThereAnyFlaggedMessage(conversation, user, MessageFlagName.UNREAD);
        conversation.addVirtualAttribute('read', !isUnread);
    }

    /**
     * The class constructor.
     *
     * @param {?Conversation} [conversation]
     */
    constructor(conversation = null){
        super();

        this.#userConversationStatusRepository = Injector.inject('UserConversationStatusRepository');
        this.#conversationRepository = Injector.inject('ConversationRepository');
        this.setConversation(conversation);
    }

    /**
     * Sets the conversation.
     *
     * @param {?Conversation} conversation
     *
     * @returns {ConversationService}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     */
    setConversation(conversation){
        if ( conversation !== null && !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        this.#conversation = conversation;
        return this;
    }

    /**
     * Returns the conversation.
     *
     * @returns {?Conversation}
     */
    getConversation(){
        return this.#conversation;
    }

    /**
     * Returns a conversation between the given users only (direct message), if exists.
     *
     * @param {string} senderUserID
     * @param {string} recipientUserID
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid recipient user ID is given.
     * @throws {IllegalArgumentException} If an invalid sender user ID is given.
     */
    async getDMConversationByMembers(senderUserID, recipientUserID){
        if ( recipientUserID === '' || typeof recipientUserID !== 'string' ){
            throw new IllegalArgumentException('Invalid recipient user ID.');
        }
        if ( senderUserID === '' || typeof senderUserID !== 'string' ){
            throw new IllegalArgumentException('Invalid sender user ID.');
        }
        const conversationList = await this.#conversationRepository.getConversationListByMembers([senderUserID, recipientUserID]);
        let DMConversation = null, i = 0, conversationListLength = conversationList.length;
        while ( DMConversation === null && i < conversationListLength ){
            if ( Object.keys(conversationList[i].getMembers()).length === 2 ){
                DMConversation = conversationList[i];
            }
            i++;
        }
        return DMConversation;
    }

    /**
     * Returns the conversation matching the given ID.
     *
     * @param {string} conversationID
     * @param {?User} [user]
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async getConversationByID(conversationID, user = null){
        if ( user !== null && !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        this.#conversation = await this.#conversationRepository.findByID(conversationID);
        if ( this.#conversation !== null && user !== null ){
            await Promise.all([
                this.#processConversationAdditionalProperties(this.#conversation, user),
                this.#processConversationMembers(this.#conversation, user)
            ]);
        }
        return this.#conversation;
    }

    /**
     * Returns all the conversations where the given user is a member.
     *
     * @param {User} user
     *
     * @returns {Promise<Conversation[]>}
     *
     * @throws {IllegalArgumentException} If invalid user instance is given.
     */
    async listConversationsByUser(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        let conversationList = await this.#conversationRepository.getUserConversationList(user), processes = [];
        conversationList = conversationList.filter((conversation) => {
            return conversation.getMembers()[user.getID()].deleted_at === null;
        });
        conversationList.forEach((conversation) => {
            processes.push(this.#processConversationAdditionalProperties(conversation, user));
            processes.push(this.#processConversationMembers(conversation, user));
        });
        await Promise.all(processes);
        return conversationList;
    }

    /**
     * Creates a new conversation.
     *
     * @param {User} user
     * @param {ConversationMemberPlaceholder[]} conversationMemberPlaceholderList
     * @param {AESStaticParameters} encryptionParameters
     * @param {HMACSigningParameters} signingParameters
     * @param {?string} [name]
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation member placeholder list is given.
     * @throws {IllegalArgumentException} If invalid encryption parameters are given.
     * @throws {IllegalArgumentException} If and invalid conversation name is given.
     * @throws {IllegalArgumentException} If invalid signing parameters are given.
     * @throws {IllegalArgumentException} If and invalid user instance is given.
     */
    async create(user, conversationMemberPlaceholderList, encryptionParameters, signingParameters, name = null){
        if ( !Array.isArray(conversationMemberPlaceholderList) || conversationMemberPlaceholderList.length <= 1 ){
            throw new IllegalArgumentException('Invalid conversation member placeholder list.');
        }
        if ( !( encryptionParameters instanceof AESStaticParameters ) ){
            throw new IllegalArgumentException('Invalid encryption parameters.');
        }
        if ( !( signingParameters instanceof HMACSigningParameters ) ){
            throw new IllegalArgumentException('Invalid signing parameters.');
        }
        if ( name !== null && ( name === '' || typeof name !== 'string' ) ){
            throw new IllegalArgumentException('Invalid conversation name.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        const memberUserIDs = conversationMemberPlaceholderList.map((conversationMemberPlaceholder) => {
            return conversationMemberPlaceholder.getUserID();
        }).join(', ');
        this._logger.debug('Creating a new conversation for the following members: ' + memberUserIDs);
        this.#conversation = null;
        if ( conversationMemberPlaceholderList.length === 2 ){
            // Conversation being created is a direct message.
            const recipientUserID = conversationMemberPlaceholderList[1].getUserID();
            const senderUserID = conversationMemberPlaceholderList[0].getUserID();
            this._logger.debug('A DM conversation is going to be created, checking if already existing...');
            this.#conversation = await this.getDMConversationByMembers(senderUserID, recipientUserID);
            if ( this.#conversation !== null ){
                this._logger.debug('DM conversation found with ID ' + this.#conversation.getID() + ' for members ' + memberUserIDs);
            }
            await this.ensureConversationMembers(true);
        }
        if ( this.#conversation === null ){
            this.#conversation = await this.#conversationRepository.create(encryptionParameters, signingParameters, conversationMemberPlaceholderList, name);
            this._logger.info('New conversation created with ID ' + this.#conversation.getID() + ' for members ' + memberUserIDs);
        }else{
            this._logger.info('Conversation ' + this.#conversation.getID() + ' restored for user ' + user.getID());
        }
        await this.#processConversationMembers(this.#conversation, user);
        return this.#conversation;
    }

    /**
     * Ensures that no conversation member has been deleted.
     *
     * @param {boolean} processDMOnly
     *
     * @returns {Promise<void>}
     */
    async ensureConversationMembers(processDMOnly){
        if ( this.#conversation !== null && ( processDMOnly !== true || this.#conversation.isDMConversation() ) && this.#conversation.hasDeletedMembers() ){
            this._logger.debug('Restoring members for DM conversation ID ' + this.#conversation.getID());
            await this.#conversationRepository.restoreConversationMembers(this.#conversation);
        }
    }

    /**
     * Returns all the conversations stats for the given user.
     *
     * @param {User} user
     *
     * @returns {Promise<ConversationStat[]>}
     *
     * @throws {IllegalArgumentException} If and invalid user instance is given.
     */
    async getConversationStats(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        return await new ConversationStatService(user).getUserCounters();
    }

    /**
     * Notifies conversation members that the given user is typing a message within the conversation.
     *
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If and invalid user is given.
     */
    async notifyTyping(user){
        await this.#userConversationStatusRepository.setStatus(this.#conversation, user, 'typing');
        const conversationID = this.#conversation.getID(), userID = user.getID();
        this._eventBroker.emit('userTyping', Object.keys(this.#conversation.getMembers()), conversationID, userID);
    }

    /**
     * Deletes the conversation defined for the given user only.
     *
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If and invalid user instance is given.
     */
    async deleteForUser(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        this._logger.debug('Deleting conversation ' + this.#conversation.getID() + ' for user ' + user.getID() + '...');
        if ( Object.keys(this.#conversation.getMembers()).length === 0 ){
            this._logger.debug('Conversation ' + this.#conversation.getID() + ' has no member left, removing it');
            return await this.delete();
        }
        this._logger.debug('Removing member ' + user.getID() + ' from conversation ' + this.#conversation.getID() + '...');
        await Promise.all([
            new MessageFlagService().removeConversationFlagsForUser(this.#conversation, user),
            new ConversationStatService(user).deleteCounter(this.#conversation)
        ]);
        await this.#conversationRepository.deleteMember(this.#conversation, user, true);
        this._eventBroker.emit('conversationDelete', [user.getID()], this.#conversation.getID());
        this._logger.info('Conversation ' + this.#conversation.getID() + ' deleted for user ' + user.getID());
    }

    /**
     * Deletes the conversation defined.
     *
     * @returns {Promise<void>}
     */
    async delete(){
        this._logger.debug('Deleting conversation ' + this.#conversation.getID() + '...');
        const userIDList = Object.keys(this.#conversation.getMembers());
        await Promise.all([
            new ConversationStatService().deleteMembersCounter(this.#conversation),
            new MessageService(this.#conversation).deleteConversationMessages(),
            new MessageFlagService().removeConversationFlags(this.#conversation)
        ]);
        await this.#conversationRepository.delete(this.#conversation);
        this._eventBroker.emit('conversationDelete', userIDList, this.#conversation.getID());
        this._logger.info('Conversation ' + this.#conversation.getID() + ' deleted');
        this.#conversation = null;
    }

    /**
     * Marks every message contained in the conversation defined as read.
     *
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If and invalid user instance is given.
     */
    async markAsRead(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        await new MessageFlagService().removeConversationFlagsForUser(this.#conversation, user);
        this._logger.info('Conversation ' + this.#conversation.getID() + ' marked as read for user ' + user.getID());
    }
}

export default ConversationService;
