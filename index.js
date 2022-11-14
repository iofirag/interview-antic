const express = require('express');
const fs = require('fs');
const yaml = require('js-yaml');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const oasTools = require('@oas-tools/core');
const multer = require('multer');
const container = require('./containerConfig');

// const upload = multer({ dest: 'uploads/' });

const app = express();

(async () => {
    const serviceData = container.resolve('serviceData');
    const serverConfig = container.resolve('serverConfig');
    const serverPort = serverConfig ? serverConfig.port : 3000;
    const logger = container.resolve('logger');
    const probe = container.resolve('probe');
    const source = container.resolve('source');
    const oasFile = yaml.load(fs.readFileSync('api/oas.yaml', 'utf8'));

    logger.log('info', serviceData);
    logger.log('info', source);

    try {
        app.use(cors());
        app.use(cookieParser());
        app.use(morgan('combined'));
        app.use(express.text());
        app.use(express.urlencoded({ extended: true }));
        app.use(multer({ dest: './uploads/' }).single('file'));
        app.get('/api-docs', (req, res) => res.json(oasFile));
        // app.post('/api/v1/word-counter', upload.single('file'), (req, res, next) => next());

        const config = {
            oasFile: './api/oas.yaml',
            // useAnnotations: true,
            middleware: {
                validator: {
                    strict: true,
                },
                router: {
                    controllers: './controllers',
                },
            },
        };
        await oasTools.initialize(app, config);
        // Start the server
        await probe.start(app, serverPort);
        probe.readyFlag = true;
        logger.log(
            'info',
            `your server is listening on http://localhost:${serverPort} 
        Swagger-ui API is available on http://localhost:${serverPort}/docs 
        Swagger-ui API-DOC is available on http://localhost:${serverPort}/api-docs`
        );
    } catch (error) {
        probe.readyFlag = false;
        probe.liveFlag = false;
        logger.log('error', `cannot start server ${error}`);
        probe.addError(error);
    }
})();
