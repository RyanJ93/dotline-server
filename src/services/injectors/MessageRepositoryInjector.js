'use strict';

import MessageRepository from '../../repositories/MessageRepository.js';
import Injector from './Injector.js';

class MessageRepositoryInjector extends Injector {
    inject(){
        return new MessageRepository();
    }
}

export default MessageRepositoryInjector;
