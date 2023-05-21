'use strict';

import NotCallableException from '../exceptions/NotCallableException.js';
import RuntimeException from '../exceptions/RuntimeException.js';

class UDTImplementation {
    /**
     * Generates an instance of this class based on the given properties obtained from an UDT object from the database.
     *
     * @param {Object} properties
     *
     * @returns {UDTImplementation}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    static makeFromUDT(properties){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }

    /**
     * The class constructor.
     *
     * @param {Object} properties
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(properties){
        if ( this.constructor === UDTImplementation ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Returns a database serializable representation of this class.
     *
     * @returns {Object}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    toUDT(){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default UDTImplementation;
