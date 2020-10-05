import {QuestionTypes} from "./question-type.enums";
import {Textoption} from "./textOption";


export class Question {

    isSelected: boolean;
    wasAsked = false;
    cutTextAt = 70;

    constructor(
        private _questionTitle: string,
        private _questionText: string,
        private _questionType: QuestionTypes,
        private _textOptions: Array<Textoption>,
        private _id: number,
        private _currentTextOptionsId: number,
        private _positionInArray: number,
        private _multipleChoices: boolean, //only concerns option "textOptions-dialog"
        private _answerLengthLimit: number //only concerns option "textfield-dialog",
    ) {
    }

    get multipleChoices(): boolean {
        return this._multipleChoices;
    }

    set multipleChoices(value: boolean) {
        this._multipleChoices = value;
    }

    get questionType() {
        return this._questionType;
    }

    set questionType(value) {
        this._questionType = value;
    }

    get questionTitle() {
        return this._questionTitle;
    }

    set questionTitle(value) {
        this._questionTitle = value;
    }

    get questionText() {
        return this._questionText;
    }

    set questionText(value) {
        this._questionText = value;
    }

    get textOptions() {
        return this._textOptions;
    }

    set textOptions(value) {
        this._textOptions = value;
    }

    addTextOption(text: string): boolean {
        if ((this.indexOfTextoption(text) < 0)) {
            this._textOptions.push(new Textoption(text, this._currentTextOptionsId, this.textOptions.length));
            this._currentTextOptionsId++;
            return true;
        }
        return false;
    }

    indexOfTextoption(text: string): number {
        let index = -1;
        for (let i = 0; i < this._textOptions.length; i++) {
            if (this._textOptions[i].text.localeCompare(text) === 0) {
                index = i;
                break;
            }
        }
        return index;
    }

    editTextOption(from: string, to: string): boolean {
        const index = this.indexOfTextoption(from);
        if (index < 0) return false;
        this._textOptions[index].text = to;
        return true;
    }

    deleteTextOption(option: Textoption): boolean {
        const index = this.textOptions.indexOf(option);
        if (index > -1) {
            this._textOptions.splice(index, 1);
            return true;
        }
        return false;
    }

    get answerLengthLimit(): number {
        return this._answerLengthLimit;
    }

    set answerLengthLimit(value: number) {
        this._answerLengthLimit = value;
    }


    get id(): number {
        return this._id;
    }

    get currentTextOptionsId(): number {
        return this._currentTextOptionsId;
    }


    get positionInArray(): number {
        return this._positionInArray;
    }

    set positionInArray(value) {
        this._positionInArray = value;
    }

    reapplyTextoptionPositionInArray() {
        for (let i = 0; i < this.textOptions.length; i++) this.textOptions[i].positionInArray = i;
    }

    get questionTextWithLineBreaks() {
        let result = '';
        let charsSinceLineBreak = 0;
        for (let i = 0; i < this.questionText.length; i++) {
            result += this.questionText[i];
            if (this.questionTitle[i] === '\n') {
                charsSinceLineBreak = 0;
                break;
            }

            if (charsSinceLineBreak === this.cutTextAt) {
                result += '\n';
                charsSinceLineBreak = 0;
            }

            charsSinceLineBreak++;
        }
        return result;
    }

    get questionTextPreview() {
        return this.questionText.length > this.cutTextAt ? this.questionText.slice(0, this.cutTextAt) + '...' : this.questionText.slice(0, this.cutTextAt);
    }

    get showExtendedText() {
        return this.questionText.length > this.cutTextAt;
  }
}
