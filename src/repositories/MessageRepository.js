'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import CassandraRepository from './CassandraRepository.js';
import Conversation from '../models/Conversation.js';
import MessageType from '../enum/MessageType.js';
import Message from '../models/Message.js';
import cassandra from 'cassandra-driver';
import User from '../models/User.js';

class MessageRepository extends CassandraRepository {
    /**
     * Returns the most recent message for a given conversation.
     *
     * @param {Conversation} conversation
     * @param {boolean} [excludeRelations=false]
     *
     * @returns {Promise<?Message>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     *
     * @deprecated
     */
    async getFirstByConversation(conversation, excludeRelations = false){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        const withoutRelations = excludeRelations ? ['conversation', 'user'] : [];
        return await Message.findOne({
            conversation: conversation.getID(),
        }, { orderByDesc: 'createdAt' }, withoutRelations);
    }

    /**
     * Returns a message given its ID.
     *
     * @param {Conversation} conversation
     * @param {string} id
     *
     * @returns {Promise<?Message>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     * @throws {IllegalArgumentException} If an id is given.
     *
     * @deprecated
     */
    async findByID(conversation, id){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid id.');
        }
        return await Message.findOne({
            conversation: conversation.getID(),
            id: id
        });
    }

    /**
     * Creates a new message.
     *
     * @param {Conversation} conversation
     * @param {User} user
     * @param {string} content
     * @param {string} type
     * @param {?string} signature
     * @param {?string} encryptionIV
     *
     * @returns {Promise<Message>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     * @throws {IllegalArgumentException} If an invalid user instance is given.
     * @throws {IllegalArgumentException} If an invalid encryption IV is given.
     * @throws {IllegalArgumentException} If an invalid signature is given.
     * @throws {IllegalArgumentException} If an invalid content is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async create(conversation, user, content, type, signature, encryptionIV){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        if ( content !== '' ){
            if ( encryptionIV === '' || typeof encryptionIV !== 'string' ){
                throw new IllegalArgumentException('Invalid encryption IV.');
            }
            if ( signature === '' || typeof signature !== 'string' ){
                throw new IllegalArgumentException('Invalid signature.');
            }
        }
        if ( Object.values(MessageType).indexOf(type) === -1 ){
            throw new IllegalArgumentException('Invalid type.');
        }
        if ( typeof content !== 'string' ){
            throw new IllegalArgumentException('Invalid content.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        const message = new Message();
        message.setEncryptionIV(( content === '' ? null : encryptionIV ));
        message.setSignature(( content === '' ? null : signature ));
        message.setID(MessageRepository.generateTimeUUID());
        message.setConversation(conversation);
        message.setCreatedAt(new Date());
        message.setUpdatedAt(new Date());
        message.setContent(content);
        message.setAttachments([]);
        message.setIsEdited(false);
        message.setType(type);
        message.setUser(user);
        await message.save();
        return message;
    }

    /**
     * Lists messages contained in a given conversation.
     *
     * @param {Conversation} conversation
     * @param {number} limit
     * @param {?string} endingID
     * @param {?string} startingID
     *
     * @returns {Promise<Message[]>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     * @throws {IllegalArgumentException} If an invalid starting message ID is given.
     * @throws {IllegalArgumentException} If an invalid ending message ID is given.
     * @throws {IllegalArgumentException} If an invalid limit value is given.
     */
    async list(conversation, limit = 250, endingID = null, startingID = null){
        if ( startingID !== null && ( startingID === '' || typeof startingID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid starting message ID.');
        }
        if ( endingID !== null && ( endingID === '' || typeof endingID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid ending message ID.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        if ( isNaN(limit) || limit <= 0 ){
            throw new IllegalArgumentException('Invalid limit.');
        }
        const filters = { conversation: conversation.getID(), id: {} };
        if ( typeof startingID === 'string' ){
            Object.assign(filters.id, { $lt: cassandra.types.TimeUuid.fromString(startingID) });
        }
        if ( typeof endingID === 'string' ){
            Object.assign(filters.id, { $gt: cassandra.types.TimeUuid.fromString(endingID) });
        }
        return await Message.find(filters, {
            orderByDesc: 'id',
            limit: limit
        }, ['conversation', 'user']);
    }

    /**
     * Edits the given message replacing its content with the given one.
     *
     * @param {Message} message
     * @param {string} content
     * @param {?string} signature
     * @param {?string} encryptionIV
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid message instance is given.
     * @throws {IllegalArgumentException} If an invalid encryption IV is given.
     * @throws {IllegalArgumentException} If an invalid signature is given.
     * @throws {IllegalArgumentException} If an invalid content is given.
     */
    async edit(message, content, signature, encryptionIV){
        if ( !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message instance.');
        }
        if ( content !== '' ){
            if ( encryptionIV === '' || typeof encryptionIV !== 'string' ){
                throw new IllegalArgumentException('Invalid encryption IV.');
            }
            if ( signature === '' || typeof signature !== 'string' ){
                throw new IllegalArgumentException('Invalid signature.');
            }
        }
        if ( typeof content !== 'string' ){
            throw new IllegalArgumentException('Invalid content.');
        }
        message.setEncryptionIV(( content === '' ? null : encryptionIV ));
        message.setSignature(( content === '' ? null : signature ));
        message.setUpdatedAt(new Date());
        message.setContent(content);
        message.setIsEdited(true);
        await message.save();
    }

    /**
     * Deletes a given message.
     *
     * @param {Message} message
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid message instance is given.
     */
    async delete(message){
        if ( !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message instance.');
        }
        await message.delete();
    }

    /**
     * Removes all the messages in a given conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation instance is given.
     */
    async deleteConversationMessages(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        await Message.findAndDelete({ conversation: conversation.getID() });
    }

    /**
     * Updates message's attachments.
     *
     * @param {Message} message
     * @param {Attachment[]} attachmentList
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid message instance is given.
     * @throws {IllegalArgumentException} If an invalid attachment list is given.
     */
    async updateAttachments(message, attachmentList){
        if ( !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message instance.');
        }
        if ( !Array.isArray(attachmentList) ){
            throw new IllegalArgumentException('Invalid attachment list.');
        }
        message.setAttachments(attachmentList.map((attachment) => attachment.toUDT()));
        await message.save();
    }
}

export default MessageRepository;
