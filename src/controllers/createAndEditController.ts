import {BAD_REQUEST, INTERNAL_SERVER_ERROR, OK} from 'http-status-codes';
import {Controller, Delete, Get, Put} from '@overnightjs/core';
import {Logger} from '@overnightjs/logger';
import {Request, Response} from 'express';
import LarsDatabase from "../lars-database";
import {Lecture} from "../app/datastructures/lecture";

import {SerializationMethods} from "../app/serializationMethods";

@Controller('lectureServiceAPI/createAndEdit')
class CreateAndEditController {

    constructor(private db: LarsDatabase, private SEPARATOR: string) {
    }

    serializationMethods = new SerializationMethods(null, this.SEPARATOR);


    @Get('receiveLecture/:accessCode')
    private getLecture(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;

            if (accessCode === undefined) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since it AccessCode is undefined'});
            }

            if (!accessCode.startsWith('A-')) {
                return res.status(BAD_REQUEST).json({error: 'Access code does not start with \'A.\' and is therefore not valid'});
            }

            try {
                this.db.getLecture(accessCode, false).then(text => {
                    return res.status(OK).attachment('ac.txt').type('txt').send(text);
                });


            } catch (error) {
                Logger.Err(error, true);
                return res.status(BAD_REQUEST).json({
                    error: error.message,
                });
            }

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('receiveAccessCode')
    private receiveAccessCode(req: Request, res: Response) {
        try {
            Logger.Info('Generating AccessCode...');

            this.generateValidCode(true, 0).then((validAccessCode) => {
                if(validAccessCode === null){
                    return res.status(INTERNAL_SERVER_ERROR).json({error: 'There is a problem generating a valid access code.'});
                } else {
                    Logger.Info('Returned code: ' + validAccessCode);
                    return res.status(OK).attachment('test.txt').type('txt').send(validAccessCode);
                }
            });
        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('receiveLectureCode')
    private receiveLectureCode(req: Request, res: Response) {
        try {
            Logger.Info('Generating LectureCode...');

            this.generateValidCode(false, 0).then((validLectureCode) => {
                if(validLectureCode === null){
                    return res.status(INTERNAL_SERVER_ERROR).json({error: 'There is a problem generating a valid lecture code.'});
                } else {
                    Logger.Info('Returned code: ' + validLectureCode);
                    return res.status(OK).attachment('test.txt').type('txt').send(validLectureCode);
                }
            });
        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    private generateCodeCandidate(forAccessCode: boolean): string{
        let code = forAccessCode?'A-':'L-';

        for(let i = 0; i < 7; i++){

            //for lecture Code only smallprint letters
            let multiplier = forAccessCode ? 52 : 26;
            let random = Math.floor(Math.random() * multiplier);
            random += 65;
            if(random > 90) random += 6;
            code += String.fromCharCode(random);
        }
        return code;
    }

    private generateValidCode(forAccessCode: boolean, count: number) : Promise<string> {
        return new Promise<string>((resolve) => {
            let candidate = this.generateCodeCandidate(forAccessCode);
            this.db.validateCode(candidate, forAccessCode).then((result) => {
                if(result){
                    resolve(candidate);
                } else if(count++ > 35000){
                    Logger.Err('Unable to find valid AccessCode');
                    resolve(null);
                } else {
                    resolve(this.generateValidCode(forAccessCode, count++));
                }
            });
        });
    }

    @Put(':accessCode')
    private saveLecture(req: Request, res: Response) {
        try {
            const data = req.body.data;
            this.deserialize(data).then(lecture => {
                if (lecture.accessCode.startsWith('A-')) {
                    this.db.saveLecture(lecture);
                    Logger.Info('Saved lecture: ' + lecture.accessCode);
                    return res.status(OK);
                } else {
                    return res.status(BAD_REQUEST).json({
                        error: 'invalid access Code',
                    });
                }

            });
            return res.status(OK);
        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }

    }

    @Delete(':accessCode')
    private deleteLecture(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;
            Logger.Info('Deleting ' + accessCode);
            this.db.deleteLecture(accessCode).then(() => {
                return res.status(OK);
            });
        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }


    async deserialize(data): Promise<Lecture> {
        return this.serializationMethods.deserialize(data, false);
    }


}

export default CreateAndEditController;
