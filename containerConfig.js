const Awilix = require("awilix");
const config = require("config");
const HttpService = require('./services/httpService');
const Logger = require('./services/loggerService');
const Tracer = require('./services/tracerService');
const Probe = require("./services/probeService");
const pkgJson = require("./package.json");

const WordService = require("./features/word/wordService");
const WordLogic = require("./features/word/wordLogic");
const WordData = require("./features/word/wordData");

const StorageService = require("./services/storageService");

const container = Awilix.createContainer({
    injectionMode: Awilix.InjectionMode.CLASSIC,
});
container.register({
    // Values
    source: Awilix.asValue(config.get("source")),
    loggerConfig: Awilix.asValue(config.get('log')),
    serverConfig: Awilix.asValue(config.get('server')),
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
    storageService: Awilix.asClass(StorageService).inject(() => ({ config: config.get('storage') })).singleton(),
    httpService: Awilix.asClass(HttpService).inject(() => ({ config: config.get('http') })).singleton(),
    logger: Awilix.asClass(Logger).inject(() => ({ config: config.get('log') })).singleton(),
    probe: Awilix.asClass(Probe).inject(() => ({ config: config.get('probe') })).singleton(),
    tracer: Awilix.asClass(Tracer).inject(() => ({ config: config.get('tracer') })).singleton(),
});

module.exports = container;