'use strict';

import { default as SentryTransportNode } from 'winston-transport-sentry-node';
import LoggerInjector from '../services/injectors/LoggerInjector.js';
import InjectionManager from '../support/InjectionManager.js';
import Config from '../facades/Config.js';
import * as Sentry from '@sentry/node';
import Provider from './Provider.js';
import App from '../facades/App.js';
import winston from 'winston';

class LoggerProvider extends Provider {
    /**
     * Configures and returns all the log transport to use.
     *
     * @returns {winston.Transport[]}
     */
    static #getLogTransports(){
        const { sentryDSN } = Config.getConfig(), transports = [
            new winston.transports.File({ filename: 'logs/combined.log' }),
            new winston.transports.Console({ colorize: true })
        ];
        if ( typeof sentryDSN === 'string' && sentryDSN !== '' ){
            const SentryTransport = SentryTransportNode.default;
            transports.push(new SentryTransport({ sentry: { dsn: sentryDSN }, level: 'error' }));
        }
        return transports;
    }

    /**
     * Sets up logging on Sentry.
     */
    static #setupSentry(){
        const { sentryDSN } = Config.getConfig();
        if ( typeof sentryDSN === 'string' && sentryDSN !== '' ){
            Sentry.init({ dsn: sentryDSN });
        }
    }

    /**
     * Sets up the logger instance and configured all the supported log transports.
     *
     * @returns {winston.Logger}
     */
    static #setupLogger(){
        const { combine, timestamp, printf, errors } = winston.format, { debug } = Config.getConfig();
        return winston.createLogger({
            transports: LoggerProvider.#getLogTransports(),
            level: ( debug === true ? 'silly' : 'info' ),
            format: combine(errors({ stack: true }), timestamp(), printf(({ level, message, label, timestamp, stack }) => {
                label = typeof label === 'string' ? ( ' [' + label + ']' ) : '';
                stack = typeof stack === 'string' ? stack : '';
                return `${timestamp}${label} ${level}: ${message} ${stack}`;
            })),
            exitOnError: false
        });
    }

    /**
     * Sets up logging.
     *
     * @returns {Promise<void>}
     */
    async run(){
        LoggerProvider.#setupSentry();
        const { debug } = Config.getConfig(), logger = LoggerProvider.#setupLogger();
        InjectionManager.getInstance().register('logger', new LoggerInjector(logger));
        App.setDebug(debug === true);
    }
}

export default LoggerProvider;
