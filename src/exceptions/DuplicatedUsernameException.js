'use strict';

import Exception from './Exception.js';

class DuplicatedUsernameException extends Exception {
    getStatus(){
        return 'ERR_DUPLICATED_USERNAME';
    }
}

export default DuplicatedUsernameException;
