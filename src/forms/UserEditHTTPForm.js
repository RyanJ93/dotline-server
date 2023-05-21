'use strict';

import HTTPForm from './HTTPForm.js';

class UserEditHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            username: { rules: { ['non-empty-string']: { msg: 'You must provide a valid username.' } }, isRequired: true },
            surname: { rules: { ['non-empty-string']: { msg: 'You must provide a valid surname.' } }, isRequired: false },
            name: { rules: { ['non-empty-string']: { msg: 'You must provide a valid name.' } }, isRequired: false }
        };
    }
}

export default UserEditHTTPForm;
