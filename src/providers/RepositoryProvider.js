'use strict';

import UserConversationStatusRepositoryInjector from '../services/injectors/UserConversationStatusRepositoryInjector.js';
import MessageCommitStatRepositoryInjector from '../services/injectors/MessageCommitStatRepositoryInjector.js';
import ConversationStatRepositoryInjector from '../services/injectors/ConversationStatRepositoryInjector.js';
import MessageCommitRepositoryInjector from '../services/injectors/MessageCommitRepositoryInjector.js';
import UserSettingsRepositoryInjector from '../services/injectors/UserSettingsRepositoryInjector.js';
import ConversationRepositoryInjector from '../services/injectors/ConversationRepositoryInjector.js';
import MessageFlagRepositoryInjector from '../services/injectors/MessageFlagRepositoryInjector.js';
import AccessTokenRepositoryInjector from '../services/injectors/AccessTokenRepositoryInjector.js';
import MessageRepositoryInjector from '../services/injectors/MessageRepositoryInjector.js';
import UserRepositoryInjector from '../services/injectors/UserRepositoryInjector.js';
import InjectionManager from '../support/InjectionManager.js';
import Provider from './Provider.js';

class RepositoryProvider extends Provider {
    /**
     * Registers all the available repositories.
     *
     * @returns {Promise<void>}
     */
    async run(){
        InjectionManager.getInstance().register('UserConversationStatusRepository', new UserConversationStatusRepositoryInjector());
        InjectionManager.getInstance().register('MessageCommitStatRepository', new MessageCommitStatRepositoryInjector());
        InjectionManager.getInstance().register('ConversationStatRepository', new ConversationStatRepositoryInjector());
        InjectionManager.getInstance().register('MessageCommitRepository', new MessageCommitRepositoryInjector());
        InjectionManager.getInstance().register('UserSettingsRepository', new UserSettingsRepositoryInjector());
        InjectionManager.getInstance().register('ConversationRepository', new ConversationRepositoryInjector());
        InjectionManager.getInstance().register('MessageFlagRepository', new MessageFlagRepositoryInjector());
        InjectionManager.getInstance().register('AccessTokenRepository', new AccessTokenRepositoryInjector());
        InjectionManager.getInstance().register('MessageRepository', new MessageRepositoryInjector());
        InjectionManager.getInstance().register('UserRepository', new UserRepositoryInjector());
    }
}

export default RepositoryProvider;
