'use strict';

import MessageCommitStatRepository from '../../repositories/MessageCommitStatRepository.js';
import Injector from './Injector.js';

class MessageCommitStatRepositoryInjector extends Injector {
    inject(){
        return new MessageCommitStatRepository();
    }
}

export default MessageCommitStatRepositoryInjector;
