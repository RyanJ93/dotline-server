'use strict';

import NotFoundHTTPException from '../exceptions/NotFoundHTTPException.js';
import PermissionService from '../services/PermissionService.js';
import AttachmentService from '../services/AttachmentService.js';
import MessageService from '../services/MessageService.js';
import Controller from './Controller.js';

class AttachmentController extends Controller {
    async get(){
        const user = this._request.authenticatedUser, { conversationID, messageID, attachmentID } = this._request.params;
        const messageService = await MessageService.makeFromEntity(user, conversationID, messageID);
        await new PermissionService().ensurePermissions(['CONVERSATION_ACCESS'], user, {
            conversation: messageService.getConversation()
        });
        const attachmentService = new AttachmentService(messageService.getMessage());
        const attachment = attachmentService.getAttachmentByID(attachmentID);
        if ( attachment === null ){
            throw new NotFoundHTTPException('No such attachment found.');
        }
        const path = attachmentService.getAttachmentFilePath(attachment.id.toString());
        this._response.sendFile(path);
    }
}

export default AttachmentController;
