'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';
import UDTImplementation from './UDTImplementation.js';

/**
 * @typedef AttachmentMetadataProperties
 *
 * @property {string} encryptionIV
 * @property {string} signature
 * @property {string} mimetype
 * @property {string} filename
 * @property {number} size
 */

/**
 * @typedef AttachmentMetadataUDTProperties
 *
 * @property {string} encryption_iv
 * @property {string} signature
 * @property {string} mimetype
 * @property {string} filename
 * @property {number} size
 */

/**
 * @abstract
 */
/* abstract */ class AttachmentMetadata extends UDTImplementation {
    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {AttachmentMetadataUDTProperties} properties
     *
     * @returns {AttachmentMetadata}
     */
    static makeFromUDT(properties){
        properties.encryptionIV = properties.encryption_iv;
        return new AttachmentMetadata(properties);
    }

    /**
     * @type {string}
     *
     * @protected
     */
    _encryptionIV;

    /**
     * @type {string}
     *
     * @protected
     */
    _signature;

    /**
     * @type {string}
     *
     * @protected
     */
    _mimetype;

    /**
     * @type {string}
     *
     * @protected
     */
    _filename;

    /**
     * @type {number}
     *
     * @protected
     */
    _size;

    /**
     * The class constructor.
     *
     * @param {AttachmentMetadataProperties} properties
     */
    constructor(properties){
        super(properties);
        if ( this.constructor === AttachmentMetadata ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }

        this._encryptionIV = properties.encryptionIV;
        this._signature = properties.signature;
        this._mimetype = properties.mimetype;
        this._filename = properties.filename;
        this._size = properties.size;
    }

    /**
     * Returns the encryption IV.
     *
     * @returns {string}
     */
    getEncryptionIV(){
        return this._encryptionIV;
    }

    /**
     * Returns the signature.
     *
     * @returns {string}
     */
    getSignature(){
        return this._signature;
    }

    /**
     * Returns the mimetype.
     *
     * @returns {string}
     */
    getMimetype(){
        return this._mimetype;
    }

    /**
     * Returns the filename.
     *
     * @returns {string}
     */
    getFilename(){
        return this._filename;
    }

    /**
     * Returns the file size.
     *
     * @returns {number}
     */
    getSize(){
        return this._size;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {AttachmentMetadataProperties}
     */
    toJSON(){
        return {
            encryptionIV: this._encryptionIV,
            signature: this._signature,
            mimetype: this._mimetype,
            filename: this._filename,
            size: this._size
        };
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {AttachmentMetadataUDTProperties}
     */
    toUDT(){
        return {
            encryption_iv: this._encryptionIV,
            signature: this._signature,
            mimetype: this._mimetype,
            filename: this._filename,
            size: this._size
        };
    }
}

export default AttachmentMetadata;
