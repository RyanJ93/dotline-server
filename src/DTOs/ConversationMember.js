'use strict';

/**
 * @typedef ConversationMemberProperties
 *
 * @property {string} encryptionKey
 * @property {string} signingKey
 * @property {Date} deletedAt
 * @property {User} user
 */

class ConversationMember {
    /**
     * @type {string}
     */
    #encryptionKey;

    /**
     * @type {string}
     */
    #signingKey;

    /**
     * @type {Date}
     */
    #deletedAt;

    /**
     * @type {User}
     */
    #user;

    /**
     * The class constructor.
     *
     * @param {ConversationMemberProperties} properties
     */
    constructor(properties){
        this.#encryptionKey = properties.encryptionKey;
        this.#signingKey = properties.signingKey;
        this.#deletedAt = properties.deletedAt;
        this.#user = properties.user;
    }

    /**
     * Returns the encryption key being used for the conversation's messages.
     *
     * @returns {string}
     */
    getEncryptionKey(){
        return this.#encryptionKey;
    }

    /**
     * Returns the signing key being used for the conversation's messages.
     *
     * @returns {string}
     */
    getSigningKey(){
        return this.#signingKey;
    }

    /**
     * Returns the date the member has been removed from the conversation.
     *
     * @returns {Date}
     */
    getDeletedAt(){
        return this.#deletedAt;
    }

    /**
     * Returns the conversation member's user.
     *
     * @returns {User}
     */
    getUser(){
        return this.#user;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {ConversationMemberProperties}
     */
    toJSON(){
        return {
            encryptionKey: this.#encryptionKey,
            signingKey: this.#signingKey,
            deletedAt: this.#deletedAt,
            user: this.#user
        };
    }
}

export default ConversationMember;
