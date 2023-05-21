'use strict';

import AttachmentMetadata from './AttachmentMetadata.js';

/**
 * @typedef {AttachmentMetadataProperties} UploadedAttachmentProperties
 *
 * @property {any} file
 */

/**
 * @typedef {AttachmentMetadataUDTProperties} UploadedAttachmentUDTProperties
 *
 * @property {any} file
 */

class UploadedAttachment extends AttachmentMetadata {
    /**
     * Generates a list of instances of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     *
     * @returns {UploadedAttachment[]}
     */
    static makeListFromHTTPRequest(request){
        if ( !Array.isArray(request.body.attachmentMetadataList) || request.body.attachmentMetadataList.length === 0 ){
            return [];
        }
        const fileList = Array.isArray(request.files['files[]']) ? request.files['files[]'] : [request.files['files[]']];
        return request.body.attachmentMetadataList.map((attachmentMetadata, index) => {
            const properties = JSON.parse(attachmentMetadata);
            properties.file = fileList[index] ?? null;
            return new UploadedAttachment(properties);
        });
    }

    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {UploadedAttachmentUDTProperties} properties
     *
     * @returns {UploadedAttachment}
     */
    static makeFromUDT(properties){
        return new UploadedAttachment(properties);
    }

    /**
     * @type {any}
     */
    #file;

    /**
     * The class constructor.
     *
     * @param {UploadedAttachmentProperties} properties
     */
    constructor(properties) {
        super(properties);

        this.#file = properties.file;
    }

    /**
     * Returns the file that has been uploaded.
     *
     * @returns {any}
     */
    getFile(){
        return this.#file;
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {UploadedAttachmentUDTProperties}
     */
    toUDT(){
        return {
            encryption_iv: this._encryptionIV,
            signature: this._signature,
            mimetype: this._mimetype,
            filename: this._filename,
            size: this._size,
            file: this.#file
        };
    }
}

export default UploadedAttachment;
