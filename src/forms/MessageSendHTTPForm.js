'use strict';

import AttachmentService from '../services/AttachmentService.js';
import HTTPForm from './HTTPForm.js';

class MessageSendHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            // encryptionIV: { rules: { ['non-empty-string']: { msg: 'You must provide a valid message encryption IV.' } }, isRequired: true },
            // signature: { rules: { ['non-empty-string']: { msg: 'You must provide a valid message signature.' } }, isRequired: true }
            type: { rules: { ['non-empty-string']: { msg: 'You must provide a valid message type.' } }, isRequired: true },
            ['files[]']: { rules: {
                ['array-length']: { msg: 'You provided way many files,', params: { length: AttachmentService.MAX_FILE_COUNT } },
                ['file-size']: { msg: 'Provided file is too big.', params: { maxSize: AttachmentService.MAX_FILE_SIZE } }
            }, isRequired: false }
        };
    }
}

export default MessageSendHTTPForm;
