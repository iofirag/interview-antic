const http = require('http');
const https = require('https');
const fs = require('fs');

module.exports = class WordLogic {
    constructor(wordData, logger, tracer, serviceData) {
        this._archive = wordData;
        this._logger = logger;
        this._tracer = tracer;
        this._serviceData = serviceData;
    }

    handleWordCounterByUrl(url) {
        const fetchHandler = (response) => {
            response.on('data', (chunk) => {
                this.handleWordCounterByText(chunk.toString());
            });
            response.on('end', () => this._logger.log('info', `finish processing data from ${url}`));
        };
        if (url.indexOf('http://') === 0) {
            http.get(url, fetchHandler).end();
        } else if (url.indexOf('https://') === 0) {
            https.get(url, fetchHandler).end();
        }
    }

    handleWordCounterByFilePath(filePath) {
        const readStream = fs.createReadStream(filePath, 'utf-8');
        readStream.on('error', (error) => this._logger.log('error', `error reading from ${filePath}, ${error.message}`));
        readStream.on('data', (chunk) => this.handleWordCounterByText(chunk.toString()));
        readStream.on('end', () => {
            this._logger.log('info', `finish processing data from ${filePath}`);
            fs.unlink(filePath, (error) => {
                if (error) {
                    this._logger.log('error', `error deleting file path ${filePath}, ${error.message}`);
                    throw error;
                }
                this._logger.log('info', `Delete File ${filePath} successfully.`);
            });
        });
    }

    handleWordCounterByText(txtChunk) {
        try {
            if (!txtChunk) {
                throw new Error('empty value');
            }
            const replaced = txtChunk.replace(/[^a-zA-Z]/g, ' ');
            const splittedArray = replaced.split(' ');
            for (let word of splittedArray) {
                word = word.replace(/ /g, '');
                if (word.length) this._archive.insertWord(word);
            }
        } catch (error) {
            this._logger.log('error', error);
            throw error;
        }
    }

    wordStatistics(value) {
        try {
            if (!value) {
                throw new Error('empty value');
            }
            return this._archive.getWordCount(value);
        } catch (error) {
            this._logger.log('error', error);
            throw error;
        }
    }

    allWordStatistics() {
        try {
            return this._archive.getAllWordsCount();
        } catch (error) {
            this._logger.log('error', error);
            throw error;
        }
    }
};
