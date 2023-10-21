'use strict';

import Permission from './Permission.js';

/**
 * @typedef {PermissionCheckContext} ConversationAccessPermissionCheckContext
 *
 * @property {Conversation} conversation
 */

class ConversationAccessPermission extends Permission {
    /**
     * Performs permission check on the provided user.
     *
     * @param {User} user
     * @param {ConversationAccessPermissionCheckContext} context
     *
     * @returns {Promise<boolean>}
     *
     * @throws {IllegalArgumentException} If an invalid context is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async check(user, context){
        await super.check(user, context);
        const { conversation } = context, members = conversation.getMembers();
        return members !== null && typeof members[user.getID().toString()] !== 'undefined';
    }
}

export default ConversationAccessPermission;
