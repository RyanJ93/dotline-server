'use strict';

/**
 * @typedef ConversationMemberPlaceholderProperties
 *
 * @property {string} encryptionKey
 * @property {string} signingKey
 * @property {string} userID
 */

class ConversationMemberPlaceholder {
    /**
     * Generates a list of instances of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     *
     * @returns {ConversationMemberPlaceholder[]}
     */
    static makeListFromHTTPRequest(request){
        return request.body.conversationMemberPlaceholderList.map((conversationMemberPlaceholder) => {
            return new ConversationMemberPlaceholder(JSON.parse(conversationMemberPlaceholder));
        });
    }

    /**
     * @type {string}
     */
    #encryptionKey;

    /**
     * @type {string}
     */
    #signingKey;

    /**
     * @type {string}
     */
    #userID;

    /**
     * The class constructor.
     *
     * @param {ConversationMemberPlaceholderProperties} properties
     */
    constructor(properties){
        this.#encryptionKey = properties.encryptionKey;
        this.#signingKey = properties.signingKey;
        this.#userID = properties.userID;
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
     * Returns the conversation member's user ID.
     *
     * @returns {string}
     */
    getUserID(){
        return this.#userID;
    }
}

export default ConversationMemberPlaceholder;
