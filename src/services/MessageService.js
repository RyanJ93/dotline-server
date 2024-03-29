'use strict';

import InvalidOperationException from '../exceptions/InvalidOperationException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import EntityNotFoundException from '../exceptions/EntityNotFoundException.js';
import ConversationStatService from './ConversationStatService.js';
import MessageCommitAction from '../enum/MessageCommitAction.js';
import MessageCommitService from './MessageCommitService.js';
import ConversationService from './ConversationService.js';
import MessageFlagService from './MessageFlagService.js';
import MessageFlagName from '../enum/MessageFlagName.js';
import AttachmentService from './AttachmentService.js';
import Conversation from '../models/Conversation.js';
import Injector from '../facades/Injector.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Service from './Service.js';

class MessageService extends Service {
    /**
     * Generates an instance of this class based on the given entity identifiers.
     *
     * @param {User} user
     * @param {string} conversationID
     * @param {?string} [messageID]
     *
     * @returns {Promise<MessageService>}
     *
     * @throws {EntityNotFoundException} If no conversation matching the given ID is found.
     * @throws {EntityNotFoundException} If no message matching the given ID is found.
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid message ID is given.
     */
    static async makeFromEntity(user, conversationID, messageID = null){
        if ( messageID !== null && ( messageID === '' || typeof messageID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid message ID.');
        }
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        const conversation = await new ConversationService().getConversationByID(conversationID, user);
        if ( conversation === null ){
            throw new EntityNotFoundException('No conversation found for the given ID.');
        }
        let message = null;
        if ( messageID !== null ){
            // A message ID has been provided, find the associated message.
            const messageRepository = Injector.inject('MessageRepository');
            message = await messageRepository.findByID(conversation, messageID);
            if ( message === null ){
                throw new EntityNotFoundException('No message found for the given ID.');
            }
        }
        return new MessageService(conversation, message);
    }

    /**
     * @type {?Conversation}
     */
    #conversation = null;

    /**
     * @type {?Message}
     */
    #message = null;

    /**
     * @type {MessageRepository}
     */
    #messageRepository;

    /**
     * Updates and ensures all the message related entities that must be processed for each conversation member.
     *
     * @param {User} user
     *
     * @returns {Promise<void>}
     */
    async #processMemberRelatedEntities(user){
        // Create a list of fake users in order to provide a list of user ID.
        const relativeUserList = [], completeUserList = [];
        Object.keys(this.#conversation.getMembers()).forEach((userID) => {
            if ( userID !== user.getID().toString() ){
                relativeUserList.push(new User().setID(userID));
            }
            completeUserList.push(new User().setID(userID));
        });
        // Mark the message as "unread" for all the conversation's members.
        await new MessageFlagService(this.#message).addMessageFlagsForMultipleUser([MessageFlagName.UNREAD], relativeUserList);
        // Increment message counter for all the conversation's members.
        await Promise.all(completeUserList.map((user => new ConversationStatService(user).incrementCounter(this.#conversation))));
    }

    /**
     * Attaches to the given message all the properties related to message flags.
     *
     * @param {Message} message
     * @param {User} user
     *
     * @returns {Promise<void>}
     */
    async #processMessageFlags(message, user){
        // Assign to the given message the defined conversation but prevent it from being shown.
        message.setConversation(this.#conversation).hideAttribute('conversation').lock();
        const flagList = await new MessageFlagService(message).getMessageFlags(user);
        message.addVirtualAttribute('deleted', ( flagList.indexOf(MessageFlagName.DELETED) >= 0 ));
        message.addVirtualAttribute('read', ( flagList.indexOf(MessageFlagName.UNREAD) === -1 ));
        message.addVirtualAttribute('userID', message.getUserID()).hideAttribute('user');
        message.addVirtualAttribute('conversationID', this.#conversation.getID());
    }

    /**
     * Adds to the defined message those attributes related to relations and flags.
     */
    #processCreatedMessageAttributes(){
        this.#message.addVirtualAttribute('conversationID', this.#message.getConversation().getID());
        this.#message.addVirtualAttribute('userID', this.#message.getUser().getID());
        this.#message.hideAttribute('conversation');
        this.#message.hideAttribute('user');
    }

    /**
     * The class constructor.
     *
     * @param {Conversation} conversation
     * @param {?Message} [message]
     */
    constructor(conversation, message = null){
        super();

        this.#messageRepository = Injector.inject('MessageRepository');
        this.setConversation(conversation).setMessage(message);
    }

    /**
     * Sets the conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {MessageService}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     */
    setConversation(conversation){
        if ( !( conversation instanceof Conversation ) ){
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
     * Sets the message.
     *
     * @param {?Message} message
     *
     * @returns {MessageService}
     *
     * @throws {IllegalArgumentException} If an invalid message instance is given.
     */
    setMessage(message){
        if ( message !== null && !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message instance.');
        }
        this.#message = message;
        return this;
    }

    /**
     * Returns the message.
     *
     * @returns {?Message}
     */
    getMessage(){
        return this.#message;
    }

    /**
     * Lists all the messages for the defined conversation.
     *
     * @param {User} user
     * @param {number} [limit=250]
     * @param {?string} [endingID]
     * @param {?string} [startingID]
     *
     * @returns {Promise<Message[]>}
     *
     * @throws {IllegalArgumentException} If an invalid starting message ID is given.
     * @throws {IllegalArgumentException} If an invalid ending message ID is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid limit is given.
     */
    async list(user, limit = 250, endingID = null, startingID = null){
        const messageList = await this.#messageRepository.list(this.#conversation, limit, endingID, startingID);
        await Promise.all(messageList.map((message) => this.#processMessageFlags(message, user)));
        // Filter out all those messages that have been deleted by the given user for itself.
        return messageList.filter((message) => !message.getVirtualAttribute('deleted'));
    }

    /**
     * Lists message commit for the defined conversation and the given user.
     *
     * @param {User} user
     * @param {number} [limit=250]
     * @param {?string} [endingMessageCommitID]
     * @param {?string} [startingMessageCommitID]
     *
     * @returns {Promise<MessageCommit[]>}
     *
     * @throws {IllegalArgumentException} If an invalid starting message commit ID is given.
     * @throws {IllegalArgumentException} If an invalid ending message commit ID is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid limit is given.
     */
    async listMessageCommits(user, limit = 250, endingMessageCommitID = null, startingMessageCommitID = null){
        const messageCommitService = new MessageCommitService(this.#conversation), processes = [];
        const messageCommitList = await messageCommitService.listMessageCommits(user, limit, endingMessageCommitID, startingMessageCommitID);
        messageCommitList.forEach((messageCommit) => {
            messageCommit.hideAttribute('conversation').hideAttribute('user');
            if ( messageCommit.getMessage() !== null ){
                processes.push(this.#processMessageFlags(messageCommit.getMessage(), user));
            }
        });
        await Promise.all(processes);
        return messageCommitList.filter((messageCommit) => {
            return messageCommit.getMessage() === null || !messageCommit.getMessage().getVirtualAttribute('deleted');
        });
    }

    /**
     * Adds a message to the defined conversation.
     *
     * @param {User} user
     * @param {string} content
     * @param {string} type
     * @param {?string} signature
     * @param {?string} encryptionIV
     * @param {UploadedAttachment[]} attachmentList
     *
     * @returns {Promise<Message>}
     *
     * @throws {IllegalArgumentException} If an invalid message attachment list is given.
     * @throws {IllegalArgumentException} If an invalid message encryption IV is given.
     * @throws {IllegalArgumentException} If an invalid message signature is given.
     * @throws {IllegalArgumentException} If an invalid message content is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid message type is given.
     * @throws {InvalidOperationException} If the message is empty.
     */
    async send(user, content, type, signature, encryptionIV, attachmentList = []){
        if ( !Array.isArray(attachmentList) ){
            throw new IllegalArgumentException('Invalid attachment list.');
        }
        if ( content === '' && attachmentList.length === 0 ){
            throw new InvalidOperationException('Empty messages are not allowed.');
        }
        if ( content === '' ){
            encryptionIV = signature = null;
        }
        await new ConversationService(this.#conversation).ensureConversationMembers(true);
        const otherMemberList = Object.keys(this.#conversation.getMembers()).filter((userID) => userID !== user.getID().toString());
        this.#message = await this.#messageRepository.create(this.#conversation, user, content, type, signature, encryptionIV);
        let message = 'Sent a new message (with type "' + type + '") by user ' + user.getID() + ' in conversation ';
        await new MessageCommitService(this.#conversation, this.#message).commitAction(MessageCommitAction.CREATE);
        this._logger.debug(message + this.#conversation.getID() + ' having ID ' + this.#message.getID());
        if ( attachmentList.length > 0 ){
            // Process attachments for the created message.
            const processedAttachmentList = await new AttachmentService(this.#message).processFileAttachments(attachmentList);
            await this.#messageRepository.updateAttachments(this.#message, processedAttachmentList);
            this._logger.debug('Attached ' + attachmentList.length + ' attachments to message ' + this.#message.getID());
        }
        this.#message.addVirtualAttribute('read', false);
        await this.#processMemberRelatedEntities(user);
        this.#processCreatedMessageAttributes();
        // Deliver created message through "message" event to every user involved in the conversation.
        this._eventBroker.emit('message', otherMemberList, this.#message);
        this._eventBroker.emit('message', [user.getID().toString()], this.#message.addVirtualAttribute('read', true));
        message = 'Delivered message creation event to clients for message ' + this.#message.getID();
        this._logger.debug(message + ' in conversation ' + this.#conversation.getID());
        return this.#message;
    }

    /**
     * Edits the defined message replacing its content with the given one.
     *
     * @param {string} content
     * @param {?string} signature
     * @param {?string} encryptionIV
     *
     * @returns {Promise<?Message>}
     *
     * @throws {IllegalArgumentException} If an invalid message encryption IV is given.
     * @throws {IllegalArgumentException} If an invalid message signature is given.
     * @throws {IllegalArgumentException} If an invalid message content is given.
     * @throws {InvalidOperationException} If the message is empty.
     */
    async edit(content, signature, encryptionIV){
        if ( content === '' && ( this.#message.getAttachments()?.length ?? 0 ) === 0 ){
            throw new InvalidOperationException('Empty messages are not allowed.');
        }
        if ( content === '' ){
            encryptionIV = signature = null;
        }
        await this.#messageRepository.edit(this.#message, content, signature, encryptionIV);
        this._logger.debug('Edited message ' + this.#message.getID());
        this.#processCreatedMessageAttributes();
        await new MessageCommitService(this.#conversation, this.#message).commitAction(MessageCommitAction.EDIT);
        // Deliver message changes through "messageEdit" event to every user involved in the conversation.
        await Promise.all(Object.keys(this.#conversation.getMembers()).map(async (memberID) => {
            const userMessage = this.#message.clone();
            await this.#processMessageFlags(userMessage, new User().setID(memberID));
            this._eventBroker.emit('messageEdit', [memberID], userMessage);
        }));
        this._logger.debug('Delivered message edit event to clients for message ' + this.#message.getID());
        return this.#message;
    }

    /**
     * Marks the defined message as deleted for the given user.
     *
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     */
    async deleteForUser(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user instance.');
        }
        this._logger.debug('Deleting message ' + this.#message.getID() + ' for user ' + user.getID() + '...');
        const messageFlagService = new MessageFlagService(this.#message);
        // Check if the message has been removed for all the conversation's members, if yes then completely remove it.
        const isFlaggedForEveryMember = await messageFlagService.isFlaggedForEveryMember(MessageFlagName.DELETED);
        if ( isFlaggedForEveryMember ){
            this._logger.debug('Message ' + this.#message.getID() + ' has been removed for every conversation member, removing it');
            return await this.delete();
        }
        // Mark the message as removed for the given user only.
        this._logger.debug('Marking message ' + this.#message.getID() + ' as deleted for user ' + user.getID() + '...');
        await Promise.all([
            new MessageCommitService(this.#conversation, this.#message).commitAction(MessageCommitAction.DELETE, user),
            messageFlagService.addMessageFlagsForUser([MessageFlagName.DELETED], user),
            new ConversationStatService(user).decrementCounter(this.#conversation)
        ]);
        // Deliver message deleted event to all the clients authenticated as the given user.
        this._logger.info('Message ' + this.#message.getID() + ' deleted for user ' + user.getID());
        this._eventBroker.emit('messageDelete', [user.getID()], this.#message.getID(), this.#conversation.getID());
        this._logger.debug('Delivered message delete event to clients for message ' + this.#message.getID() + ' and user ' + user.getID());
    }

    /**
     * Removes the defined message.
     *
     * @returns {Promise<void>}
     */
    async delete(){
        // Create a list of fake users in order to provide a list of user ID.
        const userList = Object.keys(this.#conversation.getMembers()).map((userID) => new User().setID(userID));
        this._logger.debug('Deleting message ' + this.#message.getID() + '...');
        await new MessageFlagService(this.#message).removeMessageFlagsForMultipleUser(Object.values(MessageFlagName), userList);
        await Promise.all(userList.map((user => new ConversationStatService(user).decrementCounter(this.#conversation))));
        await new MessageCommitService(this.#conversation, this.#message).commitAction(MessageCommitAction.DELETE);
        this._logger.debug('Deleting attachments for message ' + this.#message.getID() + '...');
        const memberList = Object.keys(this.#conversation.getMembers());
        await new AttachmentService(this.#message).removeAttachments();
        await this.#messageRepository.delete(this.#message);
        this._logger.info('Message ' + this.#message.getID() + ' deleted');
        // Deliver message deleted event to all the clients authenticated as a member of the conversation the message belongs to.
        this._eventBroker.emit('messageDelete', memberList, this.#message.getID(), this.#conversation.getID());
        this._logger.debug('Delivered message delete event to clients for message ' + this.#message.getID());
        this.#message = null;
    }

    /**
     * Removes all the messages contained in the defined conversation.
     *
     * @returns {Promise<void>}
     */
    async deleteConversationMessages(){
        this._logger.debug('Deleting every message in conversation ' + this.#conversation.getID() + '...');
        await new MessageCommitService(this.#conversation).removeMessageCommitsByConversation();
        await new AttachmentService().removeConversationAttachments(this.#conversation);
        await this.#messageRepository.deleteConversationMessages(this.#conversation);
        this._logger.info('Messages in conversation' + this.#conversation.getID() + ' removed');
    }

    /**
     * Marks the message defined as read.
     *
     * @param {User} user
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If and invalid user instance is given.
     */
    async markAsRead(user){
        await new MessageFlagService(this.#message).removeMessageFlagsForUser([MessageFlagName.UNREAD], user);
        await this.#processMessageFlags(this.#message, user);
        this._eventBroker.emit('messageEdit', [user.getID()], this.#message);
        this._logger.debug('Message ' + this.#message.getID() + ' marked as read for user ' + user.getID());
    }
}

export default MessageService;
