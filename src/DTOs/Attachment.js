'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import AttachmentMetadata from './AttachmentMetadata.js';
import UploadedAttachment from './UploadedAttachment.js';
import cassandra from 'cassandra-driver';

/**
 * @typedef {AttachmentMetadataProperties} AttachmentProperties
 *
 * @property {cassandra:types.Uuid} id
 */

/**
 * @typedef {AttachmentMetadataUDTProperties} AttachmentUDTProperties
 *
 * @property {cassandra:types.Uuid} id
 */

class Attachment extends AttachmentMetadata {
    /**
     * Makes an instance of the "Attachment" class from an instance of the "UploadedAttachment" class.
     *
     * @param {UploadedAttachment} uploadedAttachment
     * @param {cassandra:types.Uuid} id
     *
     * @returns {Attachment}
     *
     * @throws {IllegalArgumentException} If an invalid uploaded attachment is given.
     * @throws {IllegalArgumentException} If an invalid id is given.
     */
    static makeFromUploadedAttachment(uploadedAttachment, id){
        if ( !( uploadedAttachment instanceof UploadedAttachment ) ){
            throw new IllegalArgumentException('Invalid uploaded attachment.');
        }
        if ( !( id instanceof cassandra.types.Uuid ) ){
            throw new IllegalArgumentException('Invalid id.');
        }
        return new Attachment(Object.assign({ id: id }, uploadedAttachment.toJSON()));
    }

    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {AttachmentUDTProperties} properties
     *
     * @returns {Attachment}
     */
    static makeFromUDT(properties){
        properties.encryptionIV = properties.encryption_iv;
        return new Attachment(properties);
    }

    /**
     * @type {cassandra:types.Uuid}
     */
    #id;

    /**
     * The class constructor.
     *
     * @param {AttachmentProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#id = properties.id;
    }

    /**
     * Returns the file ID.
     *
     * @returns {cassandra:types.Uuid}
     */
    getID(){
        return this.#id;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {AttachmentProperties}
     */
    toJSON(){
        return {
            encryptionIV: this._encryptionIV,
            signature: this._signature,
            mimetype: this._mimetype,
            filename: this._filename,
            size: this._size,
            id: this.#id
        };
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {AttachmentUDTProperties}
     */
    toUDT(){
        return Object.assign(super.toUDT(), {
            id: this.#id
        });
    }
}

export default Attachment;
