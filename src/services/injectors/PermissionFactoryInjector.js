'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException.js';
import PermissionFactory from '../../factories/PermissionFactory.js';
import Injector from './Injector.js';

class PermissionFactoryInjector extends Injector {
    /**
     * @type {PermissionFactory}
     */
    #permissionFactory;

    /**
     * Sets the permission factory instance to provide.
     *
     * @param {PermissionFactory} permissionFactory
     */
    #setPermissionFactory(permissionFactory){
        if ( !( permissionFactory instanceof PermissionFactory ) ){
            throw new IllegalArgumentException('Invalid permission factory.');
        }
        this.#permissionFactory = permissionFactory;
    }

    /**
     * The class constructor.
     *
     * @param {PermissionFactory} permissionFactory
     */
    constructor(permissionFactory){
        super();

        this.#setPermissionFactory(permissionFactory);
    }

    /**
     * Injects the instance of the PermissionFactory class defined.
     *
     * @returns {PermissionFactory}
     */
    inject(){
        return this.#permissionFactory;
    }
}

export default PermissionFactoryInjector;
