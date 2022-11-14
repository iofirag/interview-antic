const Awilix = require("awilix");
const config = require("config");
const Logger = require('./services/loggerService');
const Probe = require("./services/probeService");
const pkgJson = require("./package.json");

const WordService = require("./features/word/wordService");
const WordLogic = require("./features/word/wordLogic");
const WordData = require("./features/word/wordData");

const container = Awilix.createContainer({
    injectionMode: Awilix.InjectionMode.CLASSIC,
});
container.register({
    // Values
    loggerConfig: Awilix.asValue(config.get('log')),
    serverConfig: Awilix.asValue(config.get('server')),
    oasConfig: Awilix.asValue(config.get('oas')),
    serviceData: Awilix.asValue({
        name: pkgJson.name,
        component: pkgJson.name,
        version: pkgJson.version
    }),
    // Classes
    wordService: Awilix.asClass(WordService).singleton(),
    wordLogic: Awilix.asClass(WordLogic).singleton(),
    wordData: Awilix.asClass(WordData).singleton(),
    // Vendor classes
    logger: Awilix.asClass(Logger).inject(() => ({ config: config.get('log') })).singleton(),
    probe: Awilix.asClass(Probe).inject(() => ({ config: config.get('probe') })).singleton(),
});

module.exports = container;