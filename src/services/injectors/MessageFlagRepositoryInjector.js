'use strict';

import MessageFlagRepository from '../../repositories/MessageFlagRepository.js';
import Injector from './Injector.js';

class MessageFlagRepositoryInjector extends Injector {
    inject(){
        return new MessageFlagRepository();
    }
}

export default MessageFlagRepositoryInjector;
