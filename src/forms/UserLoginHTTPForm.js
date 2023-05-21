'use strict';

import HTTPForm from './HTTPForm.js';

class UserLoginHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            username: { rules: { ['non-empty-string']: { msg: 'You must provide a valid username.' } }, isRequired: true },
            password: { rules: { ['non-empty-string']: { msg: 'You must provide a valid password.' } }, isRequired: true }
        };
    }
}

export default UserLoginHTTPForm;
