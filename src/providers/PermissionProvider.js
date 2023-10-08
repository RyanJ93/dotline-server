'use strict';

import PermissionFactoryInjector from '../services/injectors/PermissionFactoryInjector.js';
import ConversationAccessPermission from '../permissions/ConversationAccessPermission.js';
import ConversationDeletePermission from '../permissions/ConversationDeletePermission.js';
import MessageDeletePermission from '../permissions/MessageDeletePermission.js';
import MessageEditPermission from '../permissions/MessageEditPermission.js';
import PermissionFactory from '../factories/PermissionFactory.js';
import InjectionManager from '../support/InjectionManager.js';
import Provider from './Provider.js';

class PermissionProvider extends Provider {
    /**
     * Registers all the available permissions into the permission factory.
     *
     * @param {PermissionFactory} permissionFactory
     */
    static #registerPermissions(permissionFactory){
        permissionFactory.registerPermission('CONVERSATION_ACCESS', ConversationAccessPermission);
        permissionFactory.registerPermission('CONVERSATION_DELETE', ConversationDeletePermission);
        permissionFactory.registerPermission('MESSAGE_DELETE', MessageDeletePermission);
        permissionFactory.registerPermission('MESSAGE_EDIT', MessageEditPermission);
    }

    /**
     * Registers supported permissions.
     *
     * @return {Promise<void>}
     */
    async run(){
        const permissionFactory = new PermissionFactory();
        PermissionProvider.#registerPermissions(permissionFactory);
        const permissionFactoryInjector = new PermissionFactoryInjector(permissionFactory);
        InjectionManager.getInstance().register('PermissionFactory', permissionFactoryInjector);
    }
}

export default PermissionProvider;
