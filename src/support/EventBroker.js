'use strict';

import Injector from '../facades/Injector.js';
import Injectable from './Injectable.js';

class EventBroker extends Injectable {
    #webSocketServerManager;

    constructor(){
        super();

        this.#webSocketServerManager = Injector.inject('WebSocketServerManager');
    }

    /**
     *
     *
     * @param {string} name
     * @param {string[]} targetUserIDList
     * @param {...any} [data]
     */
    emit(name, targetUserIDList, ...data){
        this.#webSocketServerManager.send({
            action: 'event',
            payload: { name: name, data: data }
        }, targetUserIDList);
        return this;
    }
}

export default EventBroker;
