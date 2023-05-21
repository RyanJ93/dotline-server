'use strict';

import HTTPForm from './HTTPForm.js';

class ConversationCreateHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            conversationMemberPlaceholderList: { rules: { ['array']: { msg: 'You must provide a valid conversation member placeholder list.' } }, isRequired: true },
            encryptionKeyLength: { rules: { ['integer']: { msg: 'You must provide a valid encryption key length.' } }, isRequired: true },
            encryptionMode: { rules: { ['non-empty-string']: { msg: 'You must provide a valid encryption mode.' } }, isRequired: true },
        };
    }
}

export default ConversationCreateHTTPForm;
