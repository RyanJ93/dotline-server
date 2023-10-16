'use strict';

import FormValidationRule from './FormValidationRule.js';
import mime from 'mime-types';

/**
 * @typedef {FormValidationRuleParams} MIMETypeFormValidationRuleParams
 *
 * @property {string[]} MIMETypeList
 */

class MIMETypeFormValidationRule extends FormValidationRule {
    /**
     * Returns the default error message to use whenever this validation rule fails.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return 'Unsupported file MIME type';
    }

    /**
     * Validates a given value.
     *
     * @param {any} value
     * @param {MIMETypeFormValidationRuleParams} params
     *
     * @returns {boolean}
     */
    validate(value, params){
        if ( Array.isArray(params?.MIMETypeList) && params.MIMETypeList.length > 0 ){
            return params.MIMETypeList.indexOf(mime.lookup(value.file)) >= 0;
        }
        return false;
    }
}

export default MIMETypeFormValidationRule;
