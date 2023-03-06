'use strict';

import FormValidationProvider from './src/providers/FormValidationProvider.js';
import RepositoryProvider from './src/providers/RepositoryProvider.js';
import DatabaseProvider from './src/providers/DatabaseProvider.js';
import ProviderManager from './src/support/ProviderManager.js';
import ConfigProvider from './src/providers/ConfigProvider.js';
import ServerProvider from './src/providers/ServerProvider.js';
import LoggerProvider from './src/providers/LoggerProvider.js';
import App from './src/facades/App.js';

const providerManager = ProviderManager.getInstance();

providerManager.register(new ConfigProvider());
providerManager.register(new DatabaseProvider());
providerManager.register(new LoggerProvider());
providerManager.register(new ServerProvider());
providerManager.register(new FormValidationProvider());
providerManager.register(new RepositoryProvider());

(async () => {
    await App.bootstrap();
})().catch((ex) => {
    App.handleFatalError(ex);
    App.shutdown();
});
