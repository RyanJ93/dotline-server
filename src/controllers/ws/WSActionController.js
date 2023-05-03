'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException.js';
import WebSocketMessage from '../../DTOs/WebSocketMessage.js';

class WSActionController {
    /**
     * Returns the closure function used to invoke the given MVC controller.
     *
     * @param {string} methodName
     *
     * @returns {controllerClosure}
     */
    static getClosure(methodName){
        return async (webSocketMessage) => {
            const controller = new this(webSocketMessage);
            return await controller[methodName]();
        };
    }

    /**
     * @type {WebSocketMessage}
     *
     * @protected
     */
    _webSocketMessage;

    /**
     * The class constructor.
     *
     * @param {WebSocketMessage} webSocketMessage
     */
    constructor(webSocketMessage){

        if ( !( webSocketMessage instanceof WebSocketMessage ) ){
            throw new IllegalArgumentException('Invalid web socket message instance.');
        }
        this._webSocketMessage = webSocketMessage;
    }
}

export default WSActionController;
