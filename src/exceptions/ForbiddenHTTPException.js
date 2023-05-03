'use strict';

import HTTPException from './HTTPException.js';

class ForbiddenHTTPException extends HTTPException {
    getStatus(){
        return 'ERR_FORBIDDEN';
    }

    getCode(){
        return 403;
    }
}

export default ForbiddenHTTPException;
