import * as path from 'path';
import * as OvernightJS from '@overnightjs/core';
import {Controller, Get} from '@overnightjs/core';
import {Request, Response} from 'express';

@Controller('')
class AppController {

    @Get('/lars')
    private sendFirstScreen(req: Request, res: Response){
        res.sendFile(path.join(__dirname, '../../../dist/index.html'));
    }

    @(OvernightJS as any).Get('welcomeScreen/:studentID/:language')
    private sendWelcomeScreen = (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../../dist/index.html'));
    };

    @(OvernightJS as any).Get('lectureStudent/:lectureCode/:studentID/:language')
    private sendLectureStudentScreen = (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../../dist/index.html'));
    };


    @(OvernightJS as any).Get('createLecture/:studentId/:language')
    private sendCreateLectureScreen = (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../../dist/index.html'));
    };

    @(OvernightJS as any).Get('runningLecture/:studentId/:language')
    private sendRunningLectureScreen = (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../../dist/index.html'));
    };

}

export default AppController;
