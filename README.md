[Website](https://makarsky.github.io/quiz-app/index.html)

## Got a good quiz?

Submit a Pull Request, with your quiz added to the END of `quizzes/{category}.json` file. Make sure the quiz is in this format:

```
{
  "question": "Your question",
  "description": "A description is required only for multi-input type",
  "type": "checkbox / radio / input / multi-input",
  "choices": ["answer1", "answer2", "answer3"], - for radio and checkbox types
  "correctAnswer": "A single string for input type. A number for radio type. An array of numbers for checkbox type. An array of strings for multi-input type.",
  "madeBy": "your name / github nickname" - optional
}
```

### What you need to know

- There is 40 seconds time limit per question.
- Quiz answers are case insensitive.
- Quiz description is preformatted. You can use \n, \t, double spaces and etc. Double space is preferable for an indent because \t takes too much space.
- HTML markup is parsed as plain text.
- <in> wildcard represents an input for multi-input quizzes.
- Values in inputs are trimmed for text input type quizzes.
- There are no limits for the number of choices for radio and checkbox quiz types. However, let's keep this number reasonable. 
- Text input values cannot start with a whitespace.
