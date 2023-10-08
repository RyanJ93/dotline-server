'use strict';

import ForbiddenHTTPException from '../exceptions/ForbiddenHTTPException.js';
import MessageSendHTTPForm from '../forms/MessageSendHTTPForm.js';
import MessageEditHTTPForm from '../forms/MessageEditHTTPForm.js';
import PermissionService from '../services/PermissionService.js';
import UploadedAttachment from '../DTOs/UploadedAttachment.js';
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
        new MessageSendHTTPForm().validate(Object.assign(this._request.body, this._request.files));
        const messageService = await MessageService.makeFromEntity(user, conversationID);
        await new PermissionService().ensurePermissions(['CONVERSATION_ACCESS'], user, {
            conversation: messageService.getConversation()
        });
        const attachments = UploadedAttachment.makeListFromHTTPRequest(this._request);
        const encryptionIV = this._request.body.encryptionIV ?? null;
        const signature = this._request.body.signature ?? null;
        const content = this._request.body.content ?? '';
        const type = this._request.body.type;
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
        new MessageEditHTTPForm().validate(Object.assign(this._request.body, this._request.files));
        await new PermissionService().ensurePermissions(['MESSAGE_EDIT'], user, {
            message: messageService.getMessage()
        });
        const encryptionIV = this._request.body.encryptionIV ?? null;
        const signature = this._request.body.signature ?? null;
        const content = this._request.body.content ?? '';
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
        await new PermissionService().ensurePermissions(['CONVERSATION_ACCESS'], user, {
            conversation: messageService.getConversation()
        });
        const limit = parseInt(this._request.query.limit ?? 250);
        const startingID = this._request.query.startingID ?? null;
        const endingID = this._request.query.endingID ?? null;
        const messageList = await messageService.list(user, limit, endingID, startingID);
        this._sendSuccessResponse(200, 'SUCCESS', { messageList: messageList });
    }

    async listCommits(){
        const user = this._request.authenticatedUser, conversationID = this._request.params.conversationID;
        const messageService = await MessageService.makeFromEntity(user, conversationID);
        await new PermissionService().ensurePermissions(['CONVERSATION_ACCESS'], user, {
            conversation: messageService.getConversation()
        });
        const limit = parseInt(this._request.query.limit ?? 250);
        const startingID = this._request.query.startingID ?? null;
        const endingID = this._request.query.endingID ?? null;
        const messageCommitList = await messageService.listMessageCommits(user, limit, endingID, startingID);
        this._sendSuccessResponse(200, 'SUCCESS', { messageCommitList: messageCommitList });
    }

    /**
     * Handles message delete requests.
     *
     * @returns {Promise<void>}
     */
    async delete(){
        const user = this._request.authenticatedUser, { conversationID, messageID } = this._request.params;
        const messageService = await MessageService.makeFromEntity(user, conversationID, messageID);
        const deleteForEveryone = this._request.query.deleteForEveryone === '1';
        await new PermissionService().ensurePermissions(['MESSAGE_DELETE'], user, {
            message: messageService.getMessage(),
            deleteForEveryone: deleteForEveryone
        });
        await ( deleteForEveryone ? messageService.delete() : messageService.deleteForUser(user) );
        this._sendSuccessResponse();
    }

    /**
     * Handles message mark as read requests.
     *
     * @returns {Promise<void>}
     */
    async markAsRead(){
        const user = this._request.authenticatedUser, { conversationID, messageID } = this._request.params;
        const messageService = await MessageService.makeFromEntity(user, conversationID, messageID);
        await new PermissionService().ensurePermissions(['CONVERSATION_ACCESS'], user, {
            conversation: messageService.getConversation()
        });
        await messageService.markAsRead(user);
        this._sendSuccessResponse();
    }
}

export default MessageController;
