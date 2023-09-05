'use strict';

import HTTPForm from './HTTPForm.js';

class UserInitAccountRecoveryHTTPForm extends HTTPForm {
    /**
     * The class constructor.
     */
    constructor(){
        super();

        this._mapping = {
            recoveryKey: { rules: { ['non-empty-string']: { msg: 'You must provide a valid recovery key.' } }, isRequired: true },
            username: { rules: { ['non-empty-string']: { msg: 'You must provide a valid username.' } }, isRequired: true }
        };
    }
}

export default UserInitAccountRecoveryHTTPForm;
