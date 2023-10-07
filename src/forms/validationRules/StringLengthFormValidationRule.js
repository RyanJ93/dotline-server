'use strict';

import FormValidationRule from './FormValidationRule.js';

/**
 * @typedef {FormValidationRuleParams} StringLengthFormValidationRuleParams
 *
 * @property {?number} [maxLength]
 * @property {?number} [minLength]
 * @property {?number} [length]
 */

class StringLengthFormValidationRule extends FormValidationRule {
    /**
     * @type {string}
     */
    #lastErrorMessage = '';

    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return this.#lastErrorMessage;
    }

    /**
     * Validates a given value.
     *
     * @param {any} value
     * @param {StringLengthFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        if ( typeof value !== 'string' ){
            this.#lastErrorMessage = 'Invalid string';
            return false;
        }
        if ( params.length !== null && params.length >= 0 && params.length !== value.length ){
            this.#lastErrorMessage = 'String must be ' + params.length + ' characters long.';
            return false;
        }
        if ( params.maxLength !== null && params.maxLength >= 0 && params.maxLength < value.length ){
            this.#lastErrorMessage = 'String must shorter than ' + params.maxLength + ' characters.';
            return false;
        }
        if ( params.minLength !== null && params.minLength >= 0 && params.minLength > value.length ){
            this.#lastErrorMessage = 'String must longer than ' + params.minLength + ' characters.';
            return false;
        }
        return true;
    }
}

export default StringLengthFormValidationRule;
