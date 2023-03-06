'use strict';

import Exception from './Exception.js';

class HTTPException extends Exception {

    getCode(){
        return 400;
    }
}

export default HTTPException;
