'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import EntityNotFoundException from '../exceptions/EntityNotFoundException.js';
import Conversation from '../models/Conversation.js';
import Attachment from '../DTOs/Attachment.js';
import Message from '../models/Message.js';
import cassandra from 'cassandra-driver';
import Service from './Service.js';
import * as path from 'node:path';
import fs from 'node:fs';

class AttachmentService extends Service {
    /**
     * Returns the directory where attachment files should be stored into.
     *
     * @returns {Promise<string>}
     */
    async #getAttachmentDirectory(){
        const path = './storage/attachments/' + this.#message.getConversation().getID() + '/' + this.#message.getID();
        if ( !fs.existsSync(path) ){
            await fs.promises.mkdir(path, { recursive: true });
        }
        return path;
    }

    /**
     * @type {?Message}
     */
    #message = null;

    /**
     * The class constructor.
     *
     * @param {?Message} message
     */
    constructor(message = null){
        super();

        this.setMessage(message);
    }

    /**
     * Sets the message attachments
     *
     * @param {Message} message
     *
     * @returns {AttachmentService}
     *
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    setMessage(message){
        if ( message !== null && !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message.');
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
     * Processes uploaded attachment files.
     *
     * @param {UploadedAttachment[]} uploadedAttachmentList
     *
     * @returns {Promise<Attachment[]>}
     *
     * @throws {IllegalArgumentException} If an invalid uploaded attachment list is given.
     */
    async processFileAttachments(uploadedAttachmentList){
        if ( !Array.isArray(uploadedAttachmentList) ){
            throw new IllegalArgumentException('Invalid uploaded attachment list.');
        }
        const basePath = await this.#getAttachmentDirectory() + '/', attachmentList = [];
        for ( let i = 0 ; i < uploadedAttachmentList.length ; i++ ){
            const id = cassandra.types.Uuid.random(), path = basePath + id + '.enc';
            await fs.promises.rename(uploadedAttachmentList[i].getFile().file, path);
            attachmentList.push(Attachment.makeFromUploadedAttachment(uploadedAttachmentList[i], id));
        }
        return attachmentList;
    }

    /**
     * Removes all the attachments attached to the message defined.
     *
     * @returns {Promise<void>}
     */
    async removeAttachments(){
        const basePath = await this.#getAttachmentDirectory() + '/';
        if ( Array.isArray(this.#message.getAttachments()) ){
            await Promise.all(this.#message.getAttachments().map((attachment) => {
                return fs.promises.unlink(basePath + '/' + attachment.id + '.enc');
            }));
        }
    }

    /**
     * Returns the attachments matching the given ID.
     *
     * @param {string} attachmentID
     *
     * @returns {?Attachment}
     *
     * @throws {IllegalArgumentException} If an invalid attachment ID is given.
     */
    getAttachmentByID(attachmentID){
        if ( attachmentID === '' || typeof attachmentID !== 'string' ){
            throw new IllegalArgumentException('Invalid attachment ID.');
        }
        let attachmentList = this.#message.getAttachments(), attachment = null, i = 0;
        while ( attachment === null && i < attachmentList.length ){
            if ( attachmentList[i].id.toString() === attachmentID ){
                attachment = attachmentList[i];
            }
            i++;
        }
        return attachment;
    }

    /**
     * Returns the path where the attachment's file is located.
     *
     * @param {string} attachmentID
     *
     * @returns {string}
     *
     * @throws {EntityNotFoundException} If no attachment matching the given ID is found.
     * @throws {IllegalArgumentException} If an invalid attachment ID is given.
     */
    getAttachmentFilePath(attachmentID){
        if ( attachmentID === '' || typeof attachmentID !== 'string' ){
            throw new IllegalArgumentException('Invalid attachment ID.');
        }
        let relativePath = './storage/attachments/' + this.#message.getConversation().getID();
        relativePath += '/' + this.#message.getID() + '/' + attachmentID + '.enc';
        const absolutePath = path.resolve(relativePath);
        if ( !fs.existsSync(absolutePath) ){
            throw new EntityNotFoundException('No attachment found for the given ID.');
        }
        return absolutePath;
    }

    /**
     * Removes all the attachments for all the messages contained in a given conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async removeConversationAttachments(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        const path = './storage/attachments/' + conversation.getID();
        if ( fs.existsSync(path) ){
            await fs.promises.rm(path, { recursive: true, force: true });
        }
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(AttachmentService, 'MAX_FILE_SIZE', {
    value: 52428800,
    writable: false
});

/**
 * @constant {number}
 */
Object.defineProperty(AttachmentService, 'MAX_FILE_COUNT', {
    value: 20,
    writable: false
});

export default AttachmentService;
