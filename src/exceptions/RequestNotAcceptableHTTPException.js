'use strict';

import HTTPException from './HTTPException.js';

class RequestNotAcceptableHTTPException extends HTTPException {
    getStatus(){
        return 'ERR_NOT_ACCEPTABLE';
    }

    getCode(){
        return 406;
    }
}

export default RequestNotAcceptableHTTPException;
