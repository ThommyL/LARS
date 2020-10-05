export enum QuestionTypes {
  //IMPORTANT: Remember to adjust language.service.ts if any changes are made in questiontypes!
  Grades = 0,             //Answermode: 1 is best, 5 is worst
  YesNo = 1,              //Answermode: Yes or No question
  TextField = 2,          //Answermode: AnyText below a set amount of character
  Slider = 3,                //Answermode can be chosen from Negative 5 over neutral (0) to positive 5
  TextOptions = 4,        //Answermode: Lecturer can set multiple textOptions-dialog
  ScaleOfHappiness = 5    //Answermode: Same as Grades, but with emoticons
}
