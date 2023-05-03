'use strict';

import HTTPForm from './HTTPForm.js';

class UserSearchHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            username: { rules: { ['non-empty-string']: 'You must provide a valid username.' }, isRequired: true }
        };
    }
}

export default UserSearchHTTPForm;
