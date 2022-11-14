const winston = require('winston');

const { format } = winston;
const { timestamp, prettyPrint, combine } = format;

const LogTypeEnum = {
    Start: 'start',
    Debug: 'debug',
    Success: 'success',
    Warn: 'warn',
    Fail: 'fail',
};
module.exports.LogTypeEnum = LogTypeEnum;
module.exports = class Logger {
    constructor(config, serviceData, mandatoryFields = undefined) {
        this._config = config;
        this._serviceData = serviceData;
        this._isWriteToHttp = true;
        this._mandatoryFields = mandatoryFields ? mandatoryFields : [{ fields: ['project', 'env'] }, { serviceData: ['version', 'component'] }];

        this._logTypeMap = {
            start: {
                level: 'info',
                type: 'start',
            },
            debug: {
                level: 'debug',
                type: 'debug',
            },
            success: {
                level: 'info',
                type: 'success',
            },
            warn: {
                level: 'warn',
                type: 'warn',
            },
            fail: {
                level: 'error',
                type: 'fail',
            },
        };

        this.registerToStringifyError();
        this.validateConfig();
        const { get, util, has, ...defaultMeta } = this._config.fields;
        this._logger = winston.createLogger({
            level: this._config.level ? this._config.level : 'debug',
            format: combine(
                timestamp(),
                winston.format.printf((info) => {
                    if (info.extraData !== undefined) {
                        const extraData = info.extraData;
                        if (Object.keys(extraData).length !== 0) {
                            if (Object.keys(extraData).includes('ex')) {
                                info['exception'] = extraData['ex'];
                                delete extraData['ex'];
                            }
                            for (const key in extraData) {
                                if (extraData[key]) {
                                    info[`extraData.${key}`] = typeof extraData[key] === 'object' ? JSON.stringify(extraData[key]) : extraData[key];
                                }
                            }
                        }
                        delete info.extendData;
                    }
                    return info;
                }),
                prettyPrint()
            ),
            defaultMeta: {
                ...serviceData,
                ...defaultMeta,
            },
            transports: this.buildTransporter(),
        });
    }

    buildTransporter() {
        const transporters = [];
        const levelThatCantWriteToConsole = ['error', 'warn', 'info'];
        if (this._config.level && !levelThatCantWriteToConsole.includes(this._config.level)) {
            transporters.push(new winston.transports.Console({ timestamp: true }));
        }
        if (this._isWriteToHttp) {
            transporters.push(
                new winston.transports.Http({
                    host: this._config.connection.host,
                    port: this._config.connection.port,
                })
            );
        }
        return transporters;
    }

    handleWriteToHttp() {
        Object.prototype.hasOwnProperty.call(this._config, 'isWriteToHttp')
            ? (() => {
                  if (this._config._isWriteToHttp) {
                      this._mandatoryFields.push({
                          connection: ['host', 'port'],
                      });
                  } else {
                      this._isWriteToHttp = false;
                  }
              })()
            : this._mandatoryFields.push({ connection: ['host', 'port'] });
    }

    validateConfig() {
        const config = {
            ...this._config,
            serviceData: this._serviceData,
        };
        let missingParams = {};
        this.handleWriteToHttp(config);
        for (const key in this._mandatoryFields) {
            if (this._mandatoryFields[key]) {
                const missingFields = [];
                const [paramName] = Object.keys(this._mandatoryFields[key]);
                if (!config[paramName]) {
                    missingParams = {
                        ...missingParams,
                        ...this._mandatoryFields[key],
                    };
                } else {
                    this._mandatoryFields[key][paramName].forEach((field) => {
                        if (!Object.prototype.hasOwnProperty.call(config[paramName], field)) {
                            missingFields.push(field);
                        }
                    });
                    if (missingFields.length !== 0) {
                        missingParams[paramName] = missingFields;
                    }
                }
            }
        }

        if (Object.keys(missingParams).length !== 0) {
            const message = 'logger missing mandatory params';
            throw new Error(`${message} ${JSON.stringify(missingParams)}`);
        }
    }

    log(level, msg, extraData = {}) {
        if (extraData.constructor.name === 'Span') {
            this._logger.log(level, msg, {});
        } else if (typeof extraData === 'object') {
            this._logger.log(level, msg, { extraData });
        } else {
            this._logger.log(level, msg, {});
        }
    }

    logV2(logLevel = 'info', className = '', functionName = '', msg = '', extraData = {}) {
        let extraDataExtended = { ...extraData };
        if (logLevel.toLowerCase() === 'error') {
            extraDataExtended = { ...extraDataExtended, ex: JSON.stringify(new Error(msg ? msg : extraData.message)) };
        }
        const logMsg = this.logMsgBuilder(className, functionName, logLevel || logLevel, extraDataExtended, msg);
        return this.log(logLevel, logMsg, extraDataExtended);
    }

    logMsgBuilder(className, functionName, logType, extraData, customMsg = '') {
        const prefix = `${className} :: ${functionName}`;
        let extraDataMsg = '';
        for (const key in extraData) {
            if (extraData[key]) {
                extraDataMsg += `{${key}}, `;
            }
        }
        extraDataMsg = extraDataMsg.substring(0, extraDataMsg.length - 2);
        return `${prefix} - ${logType}. ${customMsg.length ? `${customMsg}.` : ``}${extraDataMsg.length ? ` Params: ${extraDataMsg}` : ``}`;
    }

    registerToStringifyError() {
        // eslint-disable-next-line no-extend-native
        Object.defineProperty(Error.prototype, 'toJSON', {
            value: function () {
                const alt = {};
                Object.getOwnPropertyNames(this).forEach((key) => {
                    alt[key] = this[key];
                }, this);
                return alt;
            },
            configurable: true,
            writeable: true,
        });
    }
};
