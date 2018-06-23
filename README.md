# quiz-app

## Got a good quiz?

Submit a Pull Request, with your quiz added to the quizzes/{language}.json file. Make sure the quiz is in this format:

```{
  "question": "your question",
  "description": "question description", - optional
  "type": "input, checkbox or radio",
  "choices": ["array", "of", "choices],  - for radio and checkbox types
  "correctAnswer": "a single string or array"
}```