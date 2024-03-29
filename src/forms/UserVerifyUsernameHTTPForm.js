'use strict';

import HTTPForm from './HTTPForm.js';

class UserVerifyUsernameHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            username: { rules: { ['username']: { msg: 'You must provide a valid username.' } }, isRequired: true }
        };
    }
}

export default UserVerifyUsernameHTTPForm;
