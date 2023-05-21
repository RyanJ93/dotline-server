'use strict';

import FormValidationRule from './FormValidationRule.js';
import fs from 'node:fs';

/**
 * @typedef {FormValidationRuleParams} FileSizeFormValidationRuleParams
 *
 * @property {number} maxSize
 */

class FileSizeFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'File is too big.';
    }

    /**
     * Validates a given value.
     *
     * @param {any} value
     * @param {FileSizeFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        if ( Array.isArray(value) ){
            for ( let i = 0 ; i < value.length ; i++ ){
                const fileSize = fs.statSync(value[i].file)?.size ?? null;
                if ( fileSize === null || fileSize > params.maxSize ){
                    return false;
                }
            }
            return true;
        }
        const fileSize = fs.statSync(value.file)?.size ?? null;
        return fileSize !== null || fileSize <= params.maxSize;
    }
}

export default FileSizeFormValidationRule;
