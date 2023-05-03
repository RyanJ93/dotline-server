'use strict';

import Exception from './Exception.js';

class MalformedWebSocketMessageException extends Exception {
    getStatus(){
        return 'ERR_MALFORMED_MESSAGE';
    }
}

export default MalformedWebSocketMessageException;
