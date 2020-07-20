const fs = require("fs");

/**
 *@params number numberOfQuestions, number questionsArraySize
 *@return an array with random non-repeating numbers(indexes)
 **/
function getRandomQuestionsIndex(numOfQuestions, questionsArraySize) {
  const questions = new Set();

  while (questions.size < numOfQuestions) {
    const index = Math.floor(Math.random() * questionsArraySize);
    questions.add(index);
  }

  return [...questions];
}

function getRandomQuestions(indexesArray, questionsList) {
  const questions = [];
  for (let i = 0; i < indexesArray.length; i++) {
    const index = indexesArray[i];
    const q = questionsList[index];
    delete q.correctAnswer;
    questions.push(q);
  }

  return questions;
}

function gradeQuiz(quiz, subject) {
  const rawData = fs.readFileSync("./data/data.json");
  const data = JSON.parse(rawData);

  const questions = data[subject];
  let score = 0;
  const totalNumOfQuestions = quiz.length;
  const result = {
    score: 0,
    wrongAnswers: [],
  };

  for (let i = 0; i < quiz.length; i++) {
    const questionIndex = quiz[i].questionIndex;
    const userAnswer = quiz[i].answer;

    if (questions[questionIndex].correctAnswer === userAnswer) {
      score++;
    } else {
      result.wrongAnswers.push({
        questionBody: questions[questionIndex],
        userAnswer,
      });
    }
  }

  result.score = `${score} / ${totalNumOfQuestions}`;

  return result;
}

module.exports = {
  getRandomQuestionsIndex,
  getRandomQuestions,
  gradeQuiz,
};
