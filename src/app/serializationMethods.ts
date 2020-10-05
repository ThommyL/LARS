import {Lecture} from "./datastructures/lecture";
import {Chapter} from "./datastructures/chapter";
import {QuestionTypes} from "./datastructures/question-type.enums";
import {Textoption} from "./datastructures/textOption";
import {Question} from "./datastructures/question";
import {HttpClient} from "@angular/common/http";

export class SerializationMethods {

    private types = Array<string>();


    constructor(private http: HttpClient, private SEPARATOR: string) {

        // Generating an array of questions
        for (let question in QuestionTypes) {
            // noinspection JSUnfilteredForInLoop
            this.types.push(question);
        }

        this.types.splice(0, this.types.length / 2);

    }

    /**
     * Deserialization method.
     * Since parsing to JSON would mean loosing the TypeInformation of that TS provides and casting back
     * using a map would only be less verbose if i had more than one object to actually serialize, this seemed
     * the more straightforward way to do it for the time being.
     *
     * @var exp  A variable used to assure that the structure of the read file is correct
     * @var loaded  A lecture instance that is subsequently built or in case of an error while parsing, discarded
     * @var errorDisplayed Boolean that assures that only one error Window is displayed (since you cannot break out of a forEach)
     * @param dataString Points to where the file is stored on the server
     * @param isUrl determines whether data should be fetched from server/file or if the string already contains the data
     */
    async deserialize(dataString: string, isUrl: boolean): Promise<Lecture> {
        if (isUrl) {
            return new Promise<Lecture>((resolve) => {//on first call Deserialize:
                this.http.get(dataString, {responseType: 'text'})
                    .subscribe(data => {
                        this.deserializeLectureString(data).then(lecture => resolve(lecture));
                    });
            });
        } else {
            return new Promise<Lecture>((resolve) => {//on first call Deserialize:
                this.deserializeLectureString(dataString).then(lecture => resolve(lecture));
            });
        }


    }

    async deserializeLectureString(data: string): Promise<Lecture> {
        //Creating means of control with enum
        enum expect { LectureInit, LectureTitle, Title, Text, Type, Options, Chapter, Error = 99 }

        let exp = expect.LectureInit;
        let currentText: string;
        let currentTitle: string;
        let currentType;
        let errorDisplayed = false;
        let currentMultipleChoice: boolean;
        let currentAnswerLengthLimit: number;
        let chapterCount = -1;
        let currentQuestionId: number;
        let currentQuestionTextoptionsId: number;
        let currentQuestionPositionInArray: number;

        let loaded: Lecture;

        return new Promise<Lecture>(resolve => {
            data.split('\n').forEach(x => {
                if (exp != expect.Error) { //Since breaking out of foreach is not possible
                    if (x.startsWith('LectureInit')) {
                        if (exp == expect.LectureInit) {
                            exp = expect.LectureTitle;
                            let codes = x.split(this.SEPARATOR);
                            if (codes[3].trim() != 't' && codes[3].trim() != 'f') {
                                console.warn('continuous rating: expected t or f, instead got: ' + codes[3]);
                                exp = expect.Error;
                            } else if (codes[4] != 't' && codes[4].trim() != 'f') {
                                console.warn('enable trigger: expected t or f, instead got: ' + codes[4]);
                                exp = expect.Error;
                            } else if (codes[7] === undefined || Number.isNaN(Number.parseInt(codes[7].trim()))) {
                                console.warn('error reading current chapter id: expected number, got: ' + codes[7]);
                                exp = expect.Error;
                            } else {
                                loaded = new Lecture(codes[1].trim(), codes[2].trim(), '', new Array<Chapter>(), {
                                    continuousRating: codes[3].trim() === 't',
                                    enableTrigger: codes[4].trim() === 't',
                                    triggerStrongNegative: Number.parseInt(codes[5].trim()),
                                    triggerLightNegative: Number.parseInt(codes[6].trim())
                                }, Number.parseInt(codes[7]));

                            }
                        } else {
                            console.warn('Expected LectureInit, instead got ' + expect[exp] + ', cannot load lecture');
                            exp = expect.Error;
                        }

                    } else if (x.startsWith('LectureTitle')) {
                        if (exp == expect.LectureTitle) {
                            exp = expect.Chapter;
                            loaded.lectureTitle = x.split(this.SEPARATOR)[1].trim();

                        } else {
                            console.warn('Expected LectureTitle, got: ' + expect[exp] + ', cannot load lecture');
                            exp = expect.Error;
                        }
                    } else if (x.startsWith('Chapter')) {
                        if (exp == expect.Chapter || exp == expect.Title) {
                            chapterCount++;
                            exp = expect.Title;

                            let data = x.split(this.SEPARATOR);

                            if (data[2].trim() === undefined || Number.isNaN(Number.parseInt(data[2].trim()))) {
                                console.warn('error reading chapter id: expected number, got: ' + data[2]);
                                exp = expect.Error;
                            } else if (data[3].trim() === undefined || Number.isNaN(Number.parseInt(data[3].trim()))) {
                                console.warn('error reading chapter current question id: expected number, got: ' + data[3]);
                                exp = expect.Error;
                            } else if (data[4].trim() === undefined || Number.isNaN(Number.parseInt(data[4].trim()))) {
                                console.warn('error reading chapter Array position: expected number, got: ' + data[3]);
                                exp = expect.Error;
                            } else {
                                loaded.addChapter(data[1].trim(), Number.parseInt(data[2].trim()), Number.parseInt(data[4].trim()), Number.parseInt(data[3].trim()));
                            }

                        } else {
                            console.warn('Expected Chapter, got: ' + expect[exp] + ', cannot load lecture');
                            exp = expect.Error;
                        }

                    } else if (x.startsWith('Title')) {
                        if (exp == expect.Title) {
                            exp = expect.Text;
                            let data = x.split(this.SEPARATOR);
                            currentTitle = data[1].trim();

                            if (data[2].trim() === undefined || Number.isNaN(Number.parseInt(data[2].trim()))) {
                                console.warn('error reading question id: expected number, got: ' + data[2]);
                                exp = expect.Error;
                            }
                            if (data[3].trim() === undefined || Number.isNaN(Number.parseInt(data[3].trim()))) {
                                console.warn('error reading current question textOption id: expected number, got: ' + data[3]);
                                exp = expect.Error;
                            } else if (data[4].trim() === undefined || Number.isNaN(Number.parseInt(data[4].trim()))) {
                                console.warn('error reading current question ArrayPosition: expected number, got: ' + data[3]);
                                exp = expect.Error;
                            } else {
                                currentQuestionId = Number.parseInt(data[2].trim());
                                currentQuestionTextoptionsId = Number.parseInt(data[3].trim());
                                currentQuestionPositionInArray = Number.parseInt(data[4].trim());
                            }
                        } else {
                            console.warn('Expected Title, got: ' + expect[exp] + ', cannot load lecture');
                            exp = expect.Error;
                        }

                    } else if (x.startsWith('Text')) {
                        if (exp == expect.Text) {
                            exp = expect.Type;
                            currentText = x.split(this.SEPARATOR)[1].trim();
                        } else {
                            console.warn('Expected Text, got: ' + expect[exp] + ', cannot load lecture');
                            exp = expect.Error;
                        }

                    } else if (x.startsWith('Type')) {
                        if (exp == expect.Type) {
                            exp = expect.Options;
                            let typeInfo = x.split(this.SEPARATOR);
                            currentType = QuestionTypes[typeInfo[1].trim()];
                            if (currentType === QuestionTypes.TextOptions) {
                                if (typeInfo[2] != undefined && typeInfo[2].trim() != 't' && typeInfo[2].trim() != 'f') {
                                    console.warn('Multiple choice: Expected t or f, instead got: ' + typeInfo[2].trim());
                                    exp = expect.Error;
                                } else {
                                    if (typeInfo[2] != undefined) currentMultipleChoice = typeInfo[2].trim() === 't';
                                }
                            } else if (currentType === QuestionTypes.TextField) {
                                if (typeInfo[2] === undefined || Number.isNaN(Number.parseInt(typeInfo[2].trim()))) {
                                    console.warn('AnswerLengthLimit: Expected Integer got: ' + typeInfo[2]);
                                    exp = expect.Error;
                                } else {
                                    currentAnswerLengthLimit = Number.parseInt(typeInfo[2].trim());
                                }
                            }
                        } else {
                            console.warn('Expected Type, got: ' + expect[exp] + ', cannot load lecture');
                            exp = expect.Error;
                        }
                    } else if (x.startsWith('Options')) {
                        let options = Array<Textoption>();
                        if (exp == expect.Options) {
                            exp = expect.Title;

                            let optionArguments = x.split(this.SEPARATOR);
                            optionArguments.splice(0, 1);


                            if (optionArguments[0] === undefined || optionArguments[0].length === 0) {
                                options = Array<Textoption>();
                            } else {
                                let textOptionId;
                                let textOptionArrayPosition;
                                for (let i = 0; i < optionArguments.length; i++) {
                                    if (i % 3 === 0) {
                                        if (optionArguments[i].trim() === undefined || Number.isNaN(Number.parseInt(optionArguments[i].trim()))) {
                                            console.warn('error reading textOptions id: expected number, got: ' + optionArguments[i]);
                                            exp = expect.Error;
                                            break;
                                        }
                                        textOptionId = Number.parseInt(optionArguments[i]);
                                    } else if (i % 3 === 1) {
                                        if (optionArguments[i].trim() === undefined || Number.isNaN(Number.parseInt(optionArguments[i].trim()))) {
                                            console.warn('error reading textOptions array position: expected number, got: ' + optionArguments[i]);
                                            exp = expect.Error;
                                            break;
                                        }
                                        textOptionArrayPosition = Number.parseInt(optionArguments[i]);
                                    } else {
                                        if (textOptionId === undefined) {
                                            console.warn('Textoptions ID not defined');
                                            exp = expect.Error;
                                        }
                                        options.push(new Textoption(optionArguments[i], textOptionId, textOptionArrayPosition));
                                    }
                                }
                            }

                            let q = new Question(currentTitle, currentText, currentType, options, currentQuestionId, currentQuestionTextoptionsId, currentQuestionPositionInArray, currentMultipleChoice, currentAnswerLengthLimit);
                            currentAnswerLengthLimit = undefined;
                            currentMultipleChoice = undefined;
                            loaded.chapters[chapterCount].questions.push(q);

                        } else {
                            console.warn('Expected Options, got: ' + expect[exp] + ', cannot load lecture');
                            exp = expect.Error;
                        }


                    }
                }

                if (exp == expect.Error && !errorDisplayed) { //In case of error, inform user that lecture loading failed
                    try {
                        window.alert('There has been an error loading the lecture, check the console for details');
                    } catch (e) {
                        console.warn('There has been an error loading the lecture, check the console for details');
                    }

                    errorDisplayed = true;
                    loaded = null;
                }
            }); //end forEach
            // loaded = this.sortLecturePositions(loaded);
            resolve(loaded);
        });
    }

    /**
     *
     * @param store The Lecture to serialize
     * @param url The URL needed for saving lecture to the server
     * @param isClient If true lecture is sent to server
     */
    serialize(store: Lecture, url: string, isClient: boolean): Promise<string> {
        return new Promise<string>((resolve) => {
            let data =
                'LectureInit' + this.SEPARATOR +
                store.lectureCode + this.SEPARATOR +
                store.accessCode + this.SEPARATOR;

            data += store.settings.continuousRating ? 't' : 'f';
            data += this.SEPARATOR;
            data += store.settings.enableTrigger ? 't' : 'f';
            data += this.SEPARATOR +
                store.settings.triggerStrongNegative + this.SEPARATOR +
                store.settings.triggerLightNegative;
            data += this.SEPARATOR + store.currentChapterId;
            data += '\nLectureTitle' + this.SEPARATOR + store.lectureTitle;

            for (let chapter of store.chapters) {
                data += '\nChapter' + this.SEPARATOR + chapter.title + this.SEPARATOR + chapter.id + this.SEPARATOR +
                    chapter.currentQuestionId + this.SEPARATOR + chapter.positionInArray;
                for (let question of chapter.questions) {
                    data += '\nTitle' + this.SEPARATOR +
                        question.questionTitle + this.SEPARATOR +
                        question.id + this.SEPARATOR +
                        question.currentTextOptionsId + this.SEPARATOR +
                        question.positionInArray;
                    data += '\nText' + this.SEPARATOR + question.questionText;
                    data += '\nType' + this.SEPARATOR + this.types[question.questionType];

                    if (question.questionType == QuestionTypes.TextOptions) {
                        data += this.SEPARATOR;
                        data += question.multipleChoices ? 't' : 'f';
                    } else if (question.questionType == QuestionTypes.TextField) {
                        data += this.SEPARATOR + question.answerLengthLimit;
                    }

                    data += '\nOptions';
                    if (question.textOptions != undefined) {
                        for (let option of question.textOptions) {
                            data += this.SEPARATOR + option.id;
                            data += this.SEPARATOR + option.positionInArray;
                            data += this.SEPARATOR + option.text;
                        }
                    }
                }
            }


            if (isClient) {
                this.http.put(url, {"data": data}).subscribe(
                    () => resolve(data)
                );
            } else {
                resolve(data);
            }
        });
    }

    async deleteLecture(url: string) {
        return new Promise(resolve => {
            this.http.delete(url).subscribe(
                () => resolve()
            );
        });

    }
}
