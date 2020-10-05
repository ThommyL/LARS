export class Textoption {


    constructor(
        private _text: string,
        private _id: number,
        private _positionInArray: number
    ) { }

    get id(): number {
        return this._id;
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
    }

    get positionInArray(): number {
        return this._positionInArray;
    }

    set positionInArray(value: number) {
        this._positionInArray = value;
    }
}
