'use strict';

import RepositoryProvider from '../src/providers/RepositoryProvider.js';
import DatabaseProvider from '../src/providers/DatabaseProvider.js';
import CommandProvider from '../src/providers/CommandProvider.js';
import ProviderManager from '../src/support/ProviderManager.js';
import ConfigProvider from '../src/providers/ConfigProvider.js';
import LoggerProvider from '../src/providers/LoggerProvider.js';
import App from '../src/facades/App.js';
import { Command } from 'commander';

const providerManager = ProviderManager.getInstance(), command = new Command();

providerManager.register(new CommandProvider(command));
providerManager.register(new ConfigProvider());
providerManager.register(new DatabaseProvider());
providerManager.register(new LoggerProvider());
providerManager.register(new RepositoryProvider());

(async () => {
    await App.bootstrap(true);
    await command.parseAsync();
    await App.shutdown(true);
})().catch((ex) => App.handleFatalError(ex));
