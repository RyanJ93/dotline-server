'use strict';

import HTTPForm from './HTTPForm.js';

class MessageEditHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            // encryptionIV: { rules: { ['non-empty-string']: { msg: 'You must provide a valid message encryption IV.' } }, isRequired: true },
            // signature: { rules: { ['non-empty-string']: { msg: 'You must provide a valid message signature.' } }, isRequired: true }
        };
    }
}

export default MessageEditHTTPForm;
