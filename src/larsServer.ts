import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';

import {Server} from '@overnightjs/core';
import {Logger} from '@overnightjs/logger';
import CreateAndEditController from "./controllers/createAndEditController";
import AppController from "./controllers/appController";
import LectureController from "./controllers/lectureController";
import LarsDatabase from "./lars-database";

class LarsServer extends Server {
    SEPARATOR = '#'; //WARNING: IS ALSO DEFINED IN lecture.service.ts AND language.service.ts

    constructor() {
        super();
        this.app.use(bodyParser.json()); //Needed to read the body of requests
        this.app.use(express.static(path.join(__dirname, '../../dist')));

        super.addControllers(new AppController());

        let db = new LarsDatabase('LarsDatabase.db', this.SEPARATOR);
        super.addControllers(new CreateAndEditController(db, this.SEPARATOR));
        super.addControllers(new LectureController(db));
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            Logger.Imp('Lars server running on port: ' + port);
        });
    }
}

export default LarsServer;
