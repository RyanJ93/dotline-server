'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import ForbiddenHTTPException from '../exceptions/ForbiddenHTTPException.js';
import Injector from '../facades/Injector.js';
import Service from './Service.js';
import User from '../models/User.js';

class PermissionService extends Service {
    /**
     * @type {PermissionFactory}
     */
    #permissionFactory;

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#permissionFactory = Injector.inject('PermissionFactory');
    }

    /**
     * Checks if all the given permission have been granted to the given user within the given context.
     *
     * @param {string[]} permissionList
     * @param {User} user
     * @param {PermissionCheckContext} context
     *
     * @returns {Promise<boolean>}
     *
     * @throws {UndefinedPermissionException} If no permission matching the given name is found.
     * @throws {IllegalArgumentException} If an invalid permission name is given.
     * @throws {IllegalArgumentException} If an invalid permission list is given.
     * @throws {IllegalArgumentException} If an invalid context is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async checkPermissions(permissionList, user, context){
        if ( !Array.isArray(permissionList) ){
            throw new IllegalArgumentException('Invalid permission list.');
        }
        if ( context === null || typeof context !== 'object' ){
            throw new IllegalArgumentException('Invalid context.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        let permissionsGranted = true, i = 0;
        while ( permissionsGranted && i < permissionList.length ){
            const permission = this.#permissionFactory.craft(permissionList[i]);
            permissionsGranted = await permission.check(user, context);
            i++;
        }
        return permissionsGranted;
    }

    /**
     * Checks if all the given permission have been granted to the given user within the given context, if not an exception will be thrown.
     *
     * @param {string[]} permissionList
     * @param {User} user
     * @param {PermissionCheckContext} context
     *
     * @returns {Promise<void>}
     *
     * @throws {ForbiddenHTTPException} If the given user doesn't have all the required permissions.
     * @throws {UndefinedPermissionException} If no permission matching the given name is found.
     * @throws {IllegalArgumentException} If an invalid permission name is given.
     * @throws {IllegalArgumentException} If an invalid permission list is given.
     * @throws {IllegalArgumentException} If an invalid context is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async ensurePermissions(permissionList, user, context){
        const permissionsGranted = await this.checkPermissions(permissionList, user, context);
        if ( !permissionsGranted ){
            throw new ForbiddenHTTPException('User does not have access rights to this resource.');
        }
    }
}

export default PermissionService;
