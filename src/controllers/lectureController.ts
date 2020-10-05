import {Controller, Delete, Get, Put} from '@overnightjs/core';
import {Logger} from '@overnightjs/logger';
import {Request, Response} from 'express';
import {BAD_REQUEST, INTERNAL_SERVER_ERROR, OK} from 'http-status-codes';
import LarsDatabase from "../lars-database";

@Controller('lectureServiceAPI/activeLecture')
class LectureController {

    constructor(private db: LarsDatabase) {
    }

    @Get('receiveUniqueStudentId/')
    private receiveUniqueStudentID(req: Request, res: Response) {
        try {
            Logger.Info('Generating StudentId...');

            this.generateValidStudentId(0).then((validStudentId) => {
                if (validStudentId === null) {
                    return res.status(INTERNAL_SERVER_ERROR).json({error: 'There is a problem generating a valid student ID.'});
                } else {
                    Logger.Info('Returned student ID: ' + validStudentId);
                    this.db.insertStudentID(validStudentId).then(() => {
                        return res.status(OK).attachment('id.txt').type('txt').send(validStudentId.toString());
                    });
                }
            });
        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    private generateValidStudentId(count: number): Promise<number> {
        return new Promise<number>((resolve) => {
            let candidate = this.generateStudentIdCandidate();
            this.db.validateStudentId(candidate).then((result) => {
                if (result) {
                    resolve(candidate);
                } else if (count++ > 35000) {
                    Logger.Err('Unable to find valid StudentId');
                    resolve(null);
                } else {
                    resolve(this.generateValidStudentId(count++));
                }
            });
        });
    }

    private generateStudentIdCandidate(): number {
        return Math.floor(Math.random() * (99999998) + 1); //Integer with max 8 digits, excluding 0
    }

    @Get('student/receiveLecture/:lectureCode')
    private sendLectureToStudent(req: Request, res: Response) {
        try {
            const lectureCode = req.params.lectureCode;

            if (lectureCode === undefined) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since it AccessCode is undefined'});
            }

            try {
                this.db.getLecture(lectureCode, true).then(text => {
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


    @Get('checkIfLectureIsRunning/:code/:mustAlsoBeRunning')
    private checkIfLectureCodeExists(req: Request, res: Response) {
        try {
            const code = req.params.code;

            if (!(req.params.mustAlsoBeRunning.localeCompare('true') || req.params.mustAlsoBeRunning.localeCompare('false'))) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since boolean value is invalid'});
            }

            const mustAlsoBeRunning = req.params.mustAlsoBeRunning.localeCompare('true') === 0;

            if (!(code.startsWith('A-') || code.startsWith('L-')) || code.length != 9) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the code is invalid'});
            }

            this.db.checkIfLectureIsRunning(code, mustAlsoBeRunning).then(text => {
                return res.status(OK).attachment('exists.txt').type('boolean').send(text);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    //method to set lecture to active
    @Put('lecturer/startLecture/:accessCode')
    private setLectureToRunning(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;
            this.db.insertRunningLecture(accessCode).then((text) => {
                return res.status(OK).attachment('exists.txt').type('boolean').send(true);
            });
        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Put('lecturer/setActiveQuestions/:lectureCode')
    private setActiveQuestions(req: Request, res: Response) {
        try {
            const chapterIDs = req.body.chapterIDs as number[];
            const questionIDs = req.body.questionIDs as number[];
            const lectureCode = req.params.lectureCode;

            if (chapterIDs.length != questionIDs.length) {
                Logger.Err('Unequal amount of chapterIDs and QuestionIDs detected!');
                return res.status(BAD_REQUEST).json({
                    error: 'Unequal amount of chapterIDs and QuestionIDs detected!',
                });
            }

            this.db.insertActiveQuestions(chapterIDs, questionIDs, lectureCode).then((exists) => {
                return res.status(OK).attachment('exists.txt').type('boolean').send(exists);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('receiveActiveQuestions/:lectureCode')
    private receiveActiveQuestions(req: Request, res: Response) {
        try {
            const lectureCode = req.params.lectureCode;
            if (!lectureCode.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since lectureCode is invalid'});
            }

            this.db.retrieveActiveQuestions(lectureCode).then(activeQuestions => {
                return res.status(OK).attachment('activeQuestions.txt').type('text').send(activeQuestions.slice(0, activeQuestions.length - 1));
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Put('student/setUnderstanding/:studentId/:lectureCode')
    private setUnderstanding(req: Request, res: Response) {
        try {
            const lectureCode = req.params.lectureCode;
            const studentId = req.params.studentId;
            const understanding = Number.parseInt(req.body.understanding);

            if (!lectureCode.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since lectureCode is invalid'});
            }

            if (understanding < -3 || understanding > 3) {
                return res.status(BAD_REQUEST).json({error: 'Value for understanding is out of range'});
            }

            if (understanding === undefined || understanding === null) {
                return res.status(BAD_REQUEST).json({error: 'Value for understanding is undefined or null'});
            }

            if (studentId === undefined || studentId === null) {
                return res.status(BAD_REQUEST).json({error: 'Value for studentId is undefined or null'});
            }

            this.db.insertStudentUnderstanding(lectureCode, studentId, understanding).then(() => {
                return res.status(OK).attachment('response.txt').type('text').send();
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('student/getUnderstanding/:studentId/:lectureCode')
    private getUnderstandingStudent(req: Request, res: Response) {
        try {
            const studentId = req.params.studentId;
            const lectureCode = req.params.lectureCode;

            if (!lectureCode.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since lectureCode is invalid'});
            }

            this.db.retrieveUnderstandingForStudent(studentId, lectureCode).then(understanding => {
                return res.status(OK).attachment('activeQuestions.txt').type('text').send('=' + understanding);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('lecturer/receiveStudentUnderstanding/:accessCode')
    private receiveStudentUnderstanding(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;
            if (!accessCode.startsWith('A-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the accessCode is invalid'});
            }

            this.db.retrieveStudentUnderstanding(accessCode).then(understanding => {
                return res.status(OK).attachment('activeQuestions.txt').type('text').send(understanding);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Delete('lecturer/resetUnderstanding/:accessCode')
    private resetUnderstanding(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;
            if (!accessCode.startsWith('A-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the accessCode is invalid'});
            }

            this.db.resetUnderstanding(accessCode).then(() => {
                Logger.Info('Understanding data for lecture: ' + accessCode + ' reset');
                return res.status(OK).attachment('activeQuestions.txt').type('boolean').send(true);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    //Method for obtaining the questions that were already answered on reload
    @Get('student/getAnsweredQuestions/:studentId/:lectureCode')
    private getAnsweredQuestions(req: Request, res: Response) {
        try {
            const studentId = req.params.studentId;
            const lectureCode = req.params.lectureCode;

            if (!lectureCode.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the lectureCode is invalid'});
            }

            if (Number.isNaN((Number.parseInt(studentId)))) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the studentID is NaN'});
            }

            this.db.getAnsweredQuestionsStudent(studentId, lectureCode).then(answer => {
                return res.status(OK).attachment('activeQuestions.txt').type('text').send(answer);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Delete('endLecture/:accessCode')
    private endLecture(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;
            if (!accessCode.startsWith('A-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the accessCode is invalid'});
            }

            this.db.endLecture(accessCode).then(() => {
                return res.status(OK).attachment('activeQuestions.txt').type('boolean').send(true);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Put('incrementDialogCounter/:accessCode')
    private incrementDialogCounter(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;

            if (!accessCode.startsWith('A-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since accessCode is invalid'});
            }

            this.db.incrementLastUnderstandingDialogID(accessCode).then(() => {
                return res.status(OK).attachment('response.txt').type('text').send();
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Put('lecturer/updateLectureSettings/:accessCode')
    private updateLectureSettings(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;
            const continuousRating = req.body.continuousRating as boolean;
            const triggerStrongNegative = req.body.triggerStrongNegative as number;
            const triggerLightNegative = req.body.triggerLightNegative as number;
            const enableTrigger = req.body.enableTrigger as boolean;

            if (!accessCode.startsWith('A-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since accessCode is invalid'});
            }

            this.db.updateLectureSettings(accessCode, continuousRating, triggerStrongNegative, triggerLightNegative, enableTrigger).then(() => {
                Logger.Info('Updated Lecture settings for lecture: ' + accessCode);
                return res.status(OK).attachment('response.txt').type('text').send();
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Put('student/updateLectureCode/:studentId/:lectureCode')
    private updateStudentIdLectureCode(req: Request, res: Response) {
        try {
            const studentId = req.params.studentId;
            const lectureCode = req.params.lectureCode;

            if (!lectureCode.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since lectureCode is invalid'});
            }


            this.db.incrementStudentsInLectureCounter(lectureCode, studentId).then(() => {
                this.db.updateStudentIDLectureCode(studentId, lectureCode).then(() => {
                    Logger.Info('Student ' + studentId + ' joined the lecture ' + lectureCode + '!');
                    return res.status(OK).attachment('response.txt').type('text').send();
                });
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('isRefreshNecessary/:lectureCode/:isLecturer/:concernsCurrentUnderstanding/:currentCount')
    private isRefreshNecessary(req: Request, res: Response) {
        try {
            const lectureCode = req.params.lectureCode;
            const isLecturer = req.params.isLecturer === 'lecturer';
            const concernsCurrentUnderstanding = req.params.concernsCurrentUnderstanding === 'true';
            const currentCount = Number.parseInt(req.params.currentCount);

            if (!isLecturer && req.params.isLecturer != 'student' ||
                !concernsCurrentUnderstanding && req.params.concernsCurrentUnderstanding != 'false' ||
                !Number.isInteger(currentCount)
            ) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the one or more params are invalid'});
            }

            if (!lectureCode.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the lectureCode is invalid'});
            }

            this.db.returnEventCount(lectureCode, isLecturer, concernsCurrentUnderstanding).then(eventCount => {
                /*
                The added '=' is necessary since otherwise in the case of sending just a zero it would result in:
                this error: [ERR_HTTP_INVALID_STATUS_CODE]: Invalid status code: 0
                */
                return res.status(OK).attachment('eventCount.txt').type('text').send('=' + eventCount);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('studentsInLectureCount/:accessCode')
    private getStudentsInLectureCount(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;

            if (!accessCode.startsWith('A-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the accessCode is invalid'});
            }

            this.db.getStudentsInLectureCount(accessCode).then(eventCount => {
                /*
                The added '=' is necessary since otherwise in the case of sending just a zero it would result in:
                this error: [ERR_HTTP_INVALID_STATUS_CODE]: Invalid status code: 0
                */
                return res.status(OK).attachment('eventCount.txt').type('text').send('=' + eventCount);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Put('student/putAnswer/:studentId/:lectureCode/:chapterId/:questionId')
    private studentPutAnswer(req: Request, res: Response) {
        try {
            const studentId = req.params.studentId;
            const lectureCode = req.params.lectureCode;
            const chapterId = req.params.chapterId;
            const questionId = req.params.questionId;

            const answer = req.body.answer;

            if (!lectureCode.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since lectureCode is invalid'});
            }

            if (
                Number.isNaN(Number.parseInt(studentId)) ||
                Number.isNaN(Number.parseInt(chapterId)) ||
                Number.isNaN(Number.parseInt(questionId))
            ) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the lastLoadedAnswer number is invalid'});
            }

            this.db.insertStudentAnswer(lectureCode, studentId, chapterId, questionId, answer).then(() => {
                Logger.Info('Student ' + studentId + ' joined the lecture ' + lectureCode + '!');
                return res.status(OK).attachment('response.txt').type('text').send();
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('lecturer/getStudentAnswers/:accessCode/:lastLoadedAnswer')
    private getStudentAnswers(req: Request, res: Response) {
        try {
            const accessCode = req.params.accessCode;
            const lastLoadedAnswer = req.params.lastLoadedAnswer;

            if (!accessCode.startsWith('A-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the accessCode is invalid'});
            }

            if (Number.isNaN(Number.parseInt(lastLoadedAnswer))) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the lastLoadedAnswer number is NaN'});
            }


            this.db.getStudentAnswers(accessCode, lastLoadedAnswer).then(answersString => {
                return res.status(OK).attachment('eventCount.txt').type('text').send(answersString);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('isStillRunning/:code')
    private isRunning(req: Request, res: Response) {
        try {
            const code = req.params.code;

            if (!code.startsWith('A-') && !code.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the code is invalid'});
            }

            this.db.isStillRunning(code).then(isRunning => {
                return res.status(OK).attachment('result.txt').type('text').send(isRunning);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

    @Get('getAnswerCountForQuestion/:lectureCode/:cId/:qId')
    private getAnswerCountForQuestion(req: Request, res: Response) {
        try {
            const lectureCode = req.params.lectureCode;
            const chapterId = req.params.cId;
            const questionId = req.params.qId;

            if (!lectureCode.startsWith('L-')) {
                return res.status(BAD_REQUEST).json({error: 'Request could not be handled since the accessCode is invalid'});
            }

            this.db.getAnswerCountForQuestion(lectureCode, chapterId, questionId).then(count => {
                return res.status(OK).attachment('result.txt').type('text').send('=' + count);
            });

        } catch (error) {
            Logger.Err(error, true);
            return res.status(BAD_REQUEST).json({
                error: error.message,
            });
        }
    }

}

export default LectureController;
