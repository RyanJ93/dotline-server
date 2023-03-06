'use strict';

import HTTPException from './HTTPException.js';

class UnauthorizedHTTPException extends HTTPException {
    getStatus(){
        return 'ERR_UNAUTHORIZED';
    }

    getCode(){
        return 403;
    }
}

export default UnauthorizedHTTPException;