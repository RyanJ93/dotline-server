'use strict';

import ConversationMemberPlaceholder from '../DTOs/ConversationMemberPlaceholder.js';
import ConversationCreateHTTPForm from '../forms/ConversationCreateHTTPForm.js';
import ConversationService from '../services/ConversationService.js';
import HMACSigningParameters from '../DTOs/HMACSigningParameters.js';
import AESStaticParameters from '../DTOs/AESStaticParameters.js';
import Controller from './Controller.js';

class ConversationController extends Controller {
    /**
     * Handles conversation get requests.
     *
     * @returns {Promise<void>}
     */
    async get(){
        const conversationID = this._request.params.conversationID, user = this._request.authenticatedUser;
        const conversationService = await ConversationService.makeFromEntity(conversationID, user);
        this._sendSuccessResponse(200, 'SUCCESS', { conversation: conversationService.getConversation() });
    }

    /**
     * Handles user conversations listing requests.
     *
     * @returns {Promise<void>}
     */
    async list(){
        const conversationList = await new ConversationService().listConversationsByUser(this._request.authenticatedUser);
        this._sendSuccessResponse(200, 'SUCCESS', { conversationList: conversationList });
    }

    /**
     * Handles conversation creation requests.
     *
     * @returns {Promise<void>}
     */
    async create(){
        const conversationCreateHTTPForm = new ConversationCreateHTTPForm(), conversationService = new ConversationService();
        conversationCreateHTTPForm.validate(this._request.body);
        const conversationMemberPlaceholderList = ConversationMemberPlaceholder.makeListFromHTTPRequest(this._request);
        const encryptionParameters = AESStaticParameters.makeFromHTTPRequest(this._request, 'encryption');
        const signingParameters = HMACSigningParameters.makeFromHTTPRequest(this._request, 'signing');
        const name = this._request.body.name ?? null, user = this._request.authenticatedUser;
        const conversation = await conversationService.create(user, conversationMemberPlaceholderList, encryptionParameters, signingParameters, name);
        this._sendSuccessResponse(200, 'SUCCESS', { conversation: conversation });
    }

    /**
     *
     *
     * @returns {Promise<void>}
     */
    async stats(){
        const conversationStats = await new ConversationService().getConversationStats(this._request.authenticatedUser);
        this._sendSuccessResponse(200, 'SUCCESS', { conversationStats: conversationStats });
    }

    async delete(){
        const conversationID = this._request.params.conversationID, user = this._request.authenticatedUser;
        const conversationService = await ConversationService.makeFromEntity(conversationID, user);
        const deleteForEveryone = this._request.query.deleteForEveryone === '1';
        await ( deleteForEveryone ? conversationService.delete() : conversationService.deleteForUser(user) );
        this._sendSuccessResponse();
    }
}

export default ConversationController;
