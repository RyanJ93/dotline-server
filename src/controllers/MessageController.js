'use strict';

import ForbiddenHTTPException from '../exceptions/ForbiddenHTTPException.js';
import MessageSendHTTPForm from '../forms/MessageSendHTTPForm.js';
import MessageEditHTTPForm from '../forms/MessageEditHTTPForm.js';
import MessageService from '../services/MessageService.js';
import Controller from './Controller.js';

class MessageController extends Controller {
    /**
     * Handles message send requests.
     *
     * @returns {Promise<void>}
     */
    async send(){
        const user = this._request.authenticatedUser, conversationID = this._request.params.conversationID;
        const messageService = await MessageService.makeFromEntity(user, conversationID);
        new MessageSendHTTPForm().validate(this._request.body);
        const { content, type, signature, encryptionIV } = this._request.body, attachments = [];
        const message = await messageService.send(user, content, type, signature, encryptionIV, attachments);
        this._sendSuccessResponse(200, 'SUCCESS', { message: message });
    }

    /**
     * Handles message edit requests.
     *
     * @returns {Promise<void>}
     */
    async edit(){
        const user = this._request.authenticatedUser, { conversationID, messageID } = this._request.params;
        const messageService = await MessageService.makeFromEntity(user, conversationID, messageID);
        if ( messageService.getMessage().getUserID().toString() !== user.getID().toString() ){
            throw new ForbiddenHTTPException('Cannot edit a message sent by another user.');
        }
        new MessageEditHTTPForm().validate(this._request.body);
        const { content, signature, encryptionIV } = this._request.body;
        const message = await messageService.edit(content, signature, encryptionIV);
        this._sendSuccessResponse(200, 'SUCCESS', { message: message });
    }

    /**
     * Handles message list requests.
     *
     * @returns {Promise<void>}
     */
    async list(){
        const user = this._request.authenticatedUser, conversationID = this._request.params.conversationID;
        const messageService = await MessageService.makeFromEntity(user, conversationID);
        const limit = parseInt(this._request.query.limit ?? 250);
        const startingID = this._request.query.startingID ?? null;
        const endingID = this._request.query.endingID ?? null;
        const messageList = await messageService.list(user, limit, endingID, startingID);
        this._sendSuccessResponse(200, 'SUCCESS', { messageList: messageList });
    }

    /**
     *
     *
     * @returns {Promise<void>}
     */
    async delete(){
        const user = this._request.authenticatedUser, { conversationID, messageID } = this._request.params;
        const messageService = await MessageService.makeFromEntity(user, conversationID, messageID);
        const deleteForEveryone = this._request.query.deleteForEveryone === '1';
        await ( deleteForEveryone ? messageService.delete() : messageService.deleteForUser(user) );
        this._sendSuccessResponse();
    }
}

export default MessageController;
