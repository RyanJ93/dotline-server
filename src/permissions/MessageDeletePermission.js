'use strict';

import Permission from './Permission.js';

/**
 * @typedef {PermissionCheckContext} MessageDeletePermissionCheckContext
 *
 * @property {Message} message
 * @property {boolean} [deleteForEveryone=false]
 */

class MessageDeletePermission extends Permission {
    /**
     * Performs permission check on the provided user.
     *
     * @param {User} user
     * @param {MessageDeletePermissionCheckContext} context
     *
     * @returns {Promise<boolean>}
     *
     * @throws {IllegalArgumentException} If an invalid context is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async check(user, context) {
        await super.check(user, context);
        return context.message.getUser()?.getID() === user.getID();
    }
}

export default MessageDeletePermission;
