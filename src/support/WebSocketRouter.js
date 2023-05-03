'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import NotFoundHTTPException from '../exceptions/NotFoundHTTPException.js';
import WebSocketMessage from '../DTOs/WebSocketMessage.js';

class WebSocketRouter {
    #actions = Object.create(null);

    addAction(name, handler){
        if ( name === '' || typeof name !== 'string' ){
            throw new IllegalArgumentException('Invalid action name.');
        }
        if ( typeof handler !== 'function' ){
            throw new IllegalArgumentException('Invalid action handler function.');
        }
        this.#actions[name] = handler;
        return this;
    }

    async handle(name, webSocketMessage){
        if ( !( webSocketMessage instanceof WebSocketMessage ) ){
            throw new IllegalArgumentException('Invalid web socket message instance.');
        }
        if ( name === '' || typeof name !== 'string' ){
            throw new IllegalArgumentException('Invalid action name.');
        }
        if ( typeof this.#actions[name] !== 'function' ){
            throw new NotFoundHTTPException('No such action found.');
        }
        return await this.#actions[name](webSocketMessage);
    }
}

export default WebSocketRouter;
