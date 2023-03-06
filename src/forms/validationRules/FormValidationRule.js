'use strict';

import NotCallableException from '../../exceptions/NotCallableException.js';
import RuntimeException from '../../exceptions/RuntimeException.js';
import Craftable from '../../factories/Craftable.js';

/**
 * @abstract
 */
/* abstract */ class FormValidationRule extends Craftable {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        super();

        if ( this.constructor === FormValidationRule ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    getDefaultErrorMessage(){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }

    /**
     * Validates a given value.
     *
     * @param {string} value
     *
     * @returns {boolean}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    validate(value){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default FormValidationRule;
