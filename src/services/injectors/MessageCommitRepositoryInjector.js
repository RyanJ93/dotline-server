'use strict';

import MessageCommitRepository from '../../repositories/MessageCommitRepository.js';
import Injector from './Injector.js';

class MessageCommitRepositoryInjector extends Injector {
    inject(){
        return new MessageCommitRepository();
    }
}

export default MessageCommitRepositoryInjector;
