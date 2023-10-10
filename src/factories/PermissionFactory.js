'use strict';

import UndefinedPermissionException from '../exceptions/UndefinedPermissionException.js';
import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import ParametricFactory from './ParametricFactory.js';

class PermissionFactory extends ParametricFactory {
    /**
     * @type {Object.<string, Permission.constructor>}
     */
    #permissionRegister = Object.create(null);

    /**
     * Registers a permission.
     *
     * @param {string} name
     * @param {Permission.constructor} permission
     *
     * @throws {IllegalArgumentException} If an invalid permission name is given.
     * @throws {IllegalArgumentException} If an invalid permission is given.
     */
    registerPermission(name, permission){
        // TODO: validate this.
        //if ( !( permission instanceof Permission ) ){
        //    throw new IllegalArgumentException('Invalid permission class.');
        //}
        if ( typeof name !== 'string' || name === '' ){
            throw new IllegalArgumentException('Invalid permission name.');
        }
        this.#permissionRegister[name] = permission;
        return this;
    }

    /**
     * Builds an instance of a registered permission given its name.
     *
     * @param {string} name
     *
     * @returns {Permission}
     *
     * @throws {UndefinedPermissionException} If no permission matching the given name is found.
     * @throws {IllegalArgumentException} If an invalid permission name is given.
     */
    craft(name){
        if ( typeof name !== 'string' || name === '' ){
            throw new IllegalArgumentException('Invalid permission name.');
        }
        if ( typeof this.#permissionRegister[name] === 'undefined' ){
            throw new UndefinedPermissionException('No available permission found for the given name (' + name + ').');
        }
        return new this.#permissionRegister[name]();
    }
}

export default PermissionFactory;
