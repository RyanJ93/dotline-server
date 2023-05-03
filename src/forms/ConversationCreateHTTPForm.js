'use strict';

import HTTPForm from './HTTPForm.js';

class ConversationCreateHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            conversationMemberPlaceholderList: { rules: { ['array']: 'You must provide a valid conversation member placeholder list.' }, isRequired: true },
            encryptionKeyLength: { rules: { ['integer']: 'You must provide a valid encryption key length.' }, isRequired: true },
            encryptionMode: { rules: { ['non-empty-string']: 'You must provide a valid encryption mode.' }, isRequired: true },
        };
    }
}

export default ConversationCreateHTTPForm;
