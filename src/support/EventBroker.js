'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Injector from '../facades/Injector.js';
import Injectable from './Injectable.js';

class EventBroker extends Injectable {
    /**
     * @type {WebSocketServerManager}
     */
    #webSocketServerManager;

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#webSocketServerManager = Injector.inject('WebSocketServerManager');
    }

    /**
     * Emits an event and deliver it to the clients authenticated as the provided users.
     *
     * @param {string} name
     * @param {string[]} targetUserIDList
     * @param {...any} [data]
     *
     * @returns {EventBroker}
     *
     * @throws {IllegalArgumentException} if an invalid target user ID list is given.
     * @throws {IllegalArgumentException} If an invalid event name is given.
     */
    emit(name, targetUserIDList, ...data){
        if ( name === '' || typeof name !== 'string' ){
            throw new IllegalArgumentException('Invalid event name.');
        }
        this.#webSocketServerManager.send({
            action: 'event',
            payload: { name: name, data: data }
        }, targetUserIDList);
        return this;
    }
}

export default EventBroker;
