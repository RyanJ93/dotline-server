'use strict';

import HTTPException from './HTTPException.js';

class NotFoundHTTPException extends HTTPException {
    getStatus(){
        return 'ERR_NOT_FOUND';
    }

    getCode(){
        return 403;
    }
}

export default NotFoundHTTPException;
