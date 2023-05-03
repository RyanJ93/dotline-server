'use strict';

import EventBroker from '../../support/EventBroker.js';
import Injector from './Injector.js';

class EventBrokerInjector extends Injector {
    #instance = null;

    inject(){
        if ( this.#instance === null ){
            this.#instance = new EventBroker();
        }
        return this.#instance;
    }
}

export default EventBrokerInjector;
