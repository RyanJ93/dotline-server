'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import NotCallableException from '../exceptions/NotCallableException.js';
import RuntimeException from '../exceptions/RuntimeException.js';
import Craftable from '../factories/Craftable.js';
import User from '../models/User.js';

/**
 * @typedef PermissionCheckContext
 */

/**
 * @abstract
 */
/* abstract */ class Permission extends Craftable {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        super();

        if ( this.constructor === Permission ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Performs permission check on the provided user.
     *
     * @param {User} user
     * @param {PermissionCheckContext} context
     *
     * @returns {Promise<boolean>}
     *
     * @throws {IllegalArgumentException} If an invalid context is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    async check(user, context){
        if ( context === null && typeof context !== 'object' ){
            throw new IllegalArgumentException('Invalid context.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        if ( this.constructor === Permission ){
            throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
        }
    }
}

export default Permission;
