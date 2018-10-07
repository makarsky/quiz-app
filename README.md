# quiz-app

[Website](https://makarsky.github.io/quiz-app/index.html)

## Got a good quiz?

Submit a Pull Request, with your quiz added to the `quizzes/{language}.json` file. Make sure the quiz is in this format:

```
{
  "question": "Your question",
  "description": "Question description", - optional
  "type": "input, select or radio",
  "choices": ["array", "of", "choices"],  - for radio and select types
  "correctAnswer": "a single string for input/radio type or an array for checkbox type"
}
```
