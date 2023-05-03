'use strict';

import HTTPForm from './HTTPForm.js';

class MessageSendHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            encryptionIV: { rules: { ['non-empty-string']: 'You must provide a valid message encryption IV.' }, isRequired: true },
            signature: { rules: { ['non-empty-string']: 'You must provide a valid message signature.' }, isRequired: true },
            type: { rules: { ['non-empty-string']: 'You must provide a valid message type.' }, isRequired: true }
        };
    }
}

export default MessageSendHTTPForm;
