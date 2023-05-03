'use strict';

import ConversationService from '../../services/ConversationService.js';
import WSActionController from './WSActionController.js';

class UserConversationStatusWSActionController extends WSActionController {
    /**
     * Handles requests to notify conversation members that the user is typing.
     *
     * @returns {Promise<void>}
     */
    async setTypingStatus(){
        const conversationID = this._webSocketMessage.getPayload().conversationID;
        const conversationService = await ConversationService.makeFromEntity(conversationID);
        const user = this._webSocketMessage.getClient().authenticatedUser;
        await conversationService.notifyTyping(user);
    }
}

export default UserConversationStatusWSActionController;
