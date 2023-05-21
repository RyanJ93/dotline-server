'use strict';

import InvalidInputException from '../exceptions/InvalidInputException.js';
import FormValidationService from '../services/FormValidationService.js';
import RuntimeException from '../exceptions/RuntimeException.js';

/**
 * @typedef FormFieldMappingOptions
 *
 * @property {?FormValidationRuleParams} [params]
 * @property {?string} [msg]
 */

/**
 * @typedef FormFieldMapping
 *
 * @property {Object.<string, FormFieldMappingOptions>} rules
 * @property {?boolean} [isRequired=true]
 */

/**
 * @abstract
 */
/* abstract */ class HTTPForm {
    /**
     * @type {Object.<string, FormFieldMapping>}
     *
     * @protected
     */
    _mapping = {};

    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === HTTPForm ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Returns the form field mapping.
     *
     * @returns {Object.<string, FormFieldMapping>}
     */
    getMapping(){
        return this._mapping;
    }

    /**
     * Validates the given fields upon the defined form field mapping.
     *
     * @param {Object.<string, string>} fields
     */
    validate(fields){
        const formValidationService = new FormValidationService(this);
        if ( !formValidationService.validate(fields) ){
            const invalidInputException = new InvalidInputException('Form validation failed.');
            invalidInputException.setErrorMessageBag(formValidationService.getLastErrorMessageBag());
            throw invalidInputException;
        }
    }
}

export default HTTPForm;
