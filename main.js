const QUIZ_NAMES = {
  'js': 'JavaScript',
  'java': 'Java',
  'php': 'PHP',
  'sql': 'SQL'
};

class UI {
  constructor() {
    this.quizzes = [];
    this.quizGenerator = null;
    this.menuButton = document.getElementById('menuButton');
    this.closeMenuButton = document.getElementById('closeMenuButton');
    this.startButton = document.getElementById('startButton');
    this.submitButton = document.getElementById('submitButton');
    this.navigation = document.getElementById("navigation");
    this.menuSections = document.getElementsByClassName("overlay-content");
    this.quizLabel = document.getElementById("quizLabel");
    this.quizDescription = document.getElementById('description')
    this.countdownElement = document.getElementById("countdown");
    this.quiz = document.getElementById('quiz');
    this.quizCard = document.getElementById('quiz-card');
    this.viewAnswersButton = document.getElementById('view-answers');
    this.quizTypes = Array.from(document.getElementsByClassName("quiz-type"));
    this.menuLinks = Array.from(document.getElementsByClassName("menu-link"));
    this.restartButtons = Array.from(document.getElementsByClassName('restart'));
    this.timebar = document.getElementById('timeBar');
    this.timer = new Timer(this.timebar);
    this.swiperHandler = new SwiperHandler;
  }

  toggleVisibility(element) {
    element.classList.toggle('hide');
  }

  toggleMenu() {
    this.openLink('menu');
    this.navigation.classList.toggle("overlay-opened");
  }

  closeMenu() {
    this.openLink('menu');
    this.navigation.classList.remove("overlay-opened");
  }

  openLink(id) {
    [].forEach.call(this.menuSections, (e) => e.style.display = "none");
    document.getElementById(id).style.display = "block";
  }

  hideDescription() {
    this.toggleVisibility(this.startButton);
    this.quizDescription.classList.toggle('remove-scale');
  }

  getUserAnswer() {
    switch (randomQuizzes[currentQuizIndex].type) {
      case 'radio':
        return this.quizCard.querySelector('input[name=answer]:checked').value;
      case 'input':
        return this.quizCard.querySelector('input').value;
      case 'checkbox':
        return Array.from(this.quizCard.querySelectorAll('input[name=answer]:checked')).map(answers, (e) => e.value);
      case 'multi-input':
        return Array.from(this.quizCard.querySelectorAll('input')).map(answers, (e) => e.value);
        // todo: implement multi-input quizzes
      default:
        throw new Error('Unknown quiz type.');
    }
  }

  countdown() {
    let counter = 3;
    
    let countInterval = setInterval(() => {
      this.countdownElement.innerHTML = counter--;
      if (counter === -1) {
        clearInterval(countInterval);
        this.countdownElement.innerHTML = "";
  
        this.toggleVisibility(this.quiz);
        
        this.timer.start();
      };
    }, 700)
  }

  stopTimer() {
    this.timer.stop();
  }

  startTimer() {
    this.timer.start();
  }

  setQuizLabel(quizLabel) {
    this.quizLabel.innerHTML = quizLabel;
    this.closeMenu();
  }
  
  // todo: remove after refactoring
  addQuizzes(randomQuizzes) {
    this.quizCard.innerHTML = randomQuizzes.map(buildQuiz).join('');

    // TODO: remove after refactoring
    showTab(currentQuizIndex); // Show the current card
  }

  *initQuizGenerator() {
    for (let quiz of this.quizzes) {
      yield quiz;
    }
  }

  renderNextQuiz() {
    let quiz = this.quizGenerator.next();

    if (!quiz.done) {
      this.quizCard.innerHTML = 3 + quiz.value;
    } else {
      return false;
    }

    return true;
  }

  setQuizzes(quizzes) {
    this.quizzes = quizzes.map(this.buildQuiz.bind(this));

    this.quizGenerator = this.initQuizGenerator();
  }

  buildQuiz(rawQuiz) {
    const header = `<h4>${rawQuiz.question ? rawQuiz.question : ''}</h4>
    <div class="description">${rawQuiz.description ? rawQuiz.description : ''}</div>
    <br>`;

    switch (rawQuiz.type) {
      case 'checkbox':
      case 'radio':
        return header + this.buildChoices(rawQuiz.type, rawQuiz.choices);
      case 'input':
        return header + `<div class="input-container"><input class="input" maxlength="${rawQuiz.correctAnswer.length}"></div>`;
    }
  }

  buildChoices(type, choices) {
    return choices.map((type => choice =>
      `<div class="${type}">
        <label><input type="${type}" name="answer" value="${choice}">${choice}</label>
      </div>`)(type)).join('');
  }

  restart() {
    this.quizzes.length = 0;
    document.querySelector('.swiper-custom-pagination').classList.add('hide');
    document.querySelector('#answers').classList.add('hide');
    document.querySelector('#challenge-steps').classList.remove('hide');
    document.querySelector('#result-card').classList.add('hide');
    let steps = document.querySelectorAll('#challenge-steps > .step');
    [].map.call(steps, (e) => e.className = 'step');
    document.querySelector("#description").classList.remove('remove-scale');
    this.toggleVisibility(document.querySelector('#description > button'));
    this.toggleVisibility(document.querySelector('#submitButton'));
    document.querySelector('#timeBar').classList.remove('remove-time');
    document.getElementById('quiz-card').classList.remove("removed-item");
    this.swiperHandler.destroySwiper();
  }

  viewAnswers() {
    document.querySelector('#result-card').classList.add('hide');
    document.querySelector('#challenge-steps').classList.add('hide');
    document.querySelector('#answers').classList.remove('hide');
    document.querySelector('.swiper-custom-pagination').classList.remove('hide');
    this.swiperHandler.initSwiper();
  }
}

class Game {
  constructor() {
    this.numberOfQuizzes = 5;
    this.quizTime = 40;
    this.quizType = 'js';
    this.quizNames = Object.assign({}, QUIZ_NAMES);
    this.quizzes = [];
  }

  setQuizType(quizType) {
    this.quizType = quizType;
    // TODO: remove after refactoring
    quizName = quizType;

    return this.quizNames[quizType];
  }

  setQuizzes(quizzes) {
    this.quizzes = quizzes;
  }

  restart() {
    currentQuizIndex = 0;
  }
}

class Controller {
  constructor(ui, game, quizService) {
    this.ui = ui;
    this.game = game;
    this.quizService = quizService
  }

  start() {
    this.ui.hideDescription();
    this.ui.countdown();

    // let q = this.ui.renderNextQuiz();
  }

  submitAnswer() {
    let answer = this.ui.getUserAnswer();
    let isCorrect = this.quizService.checkUserAnswer(answer);
    this.ui.showIsCorrect(isCorrect);
    this.ui.nextQuiz();
  }

  stopTimer() {
    this.ui.stopTimer();
  }

  startTimer() {
    this.ui.startTimer();
  }

  toggleMenu() {
    this.ui.toggleMenu();
  }

  // todo: rename setQuizzes
  setQuizType(quizType) {
    const quizLabel = this.game.setQuizType(quizType)
    this.ui.setQuizLabel(quizLabel);

    this.loadQuizzes()
  }

  restart() {
    this.ui.restart();
    this.game.restart();

    this.loadQuizzes();
  }

  loadQuizzes() {
    this.quizService.loadQuizzes(this.game.quizType).then((randomQuizzes) => {
      // todo: remove after refactoring
      this.ui.addQuizzes(randomQuizzes);

      this.game.setQuizzes(randomQuizzes);
      this.ui.setQuizzes(randomQuizzes);
    });
  }

  viewAnswers() {
    this.ui.viewAnswers();
  }
}

function eventListeners() {
  const ui = new UI;
  const game = new Game;
  const quizService = new QuizService();
  const controller = new Controller(ui, game, quizService);
  
  ui.startButton.onclick = () => controller.start();
  ui.submitButton.onclick = submitAnswer;
  ui.menuButton.addEventListener('click', () => controller.toggleMenu());
  ui.closeMenuButton.onclick = () => controller.toggleMenu();
  ui.viewAnswersButton.onclick = () => controller.viewAnswers();
  document.body.onkeyup = (e) => e.key === "Escape" ? controller.toggleMenu() : null;
  document.addEventListener('timeout', () => submitAnswer());
  document.addEventListener('answerIsSubmitted', () => controller.stopTimer());
  document.addEventListener('newCardIsShown', () => controller.startTimer());

  ui.quizTypes.forEach((value) => {
    value.onclick = controller.setQuizType.bind(controller, value.getAttribute('data-quiz-type'));
  });

  ui.menuLinks.forEach((value) => {
    value.onclick = () => ui.openLink(value.dataset.menu);
  });

  ui.restartButtons.forEach((value) => {
    value.onclick = () => controller.restart();
  });

  controller.setQuizType('js');
}

document.addEventListener('DOMContentLoaded', eventListeners);

class Timer {
  constructor(timeBarDOMElement) {
    this.timeBar = timeBarDOMElement;
    this.quizTime = 40;
  }

  start() {
    this.timeBar.classList.add('timer-animation');
    
    const frame = () => {
      const timerEvent = document.createEvent('Event');
      timerEvent.initEvent('timeout', false, false);
      document.dispatchEvent(timerEvent);
    }

    this.timer = setTimeout(frame, this.quizTime * 1000);
  }

  stop() {
    let width = this.timeBar.getBoundingClientRect().width;
    this.timeBar.classList.remove('timer-animation');
    this.timeBar.style.width = width + 'px';
    clearTimeout(this.timer);
  }
}

class QuizService {
  loadQuizzes(quizName) {
    return fetch(`quizzes/${quizName}.json`)
      .then((result) => result.json())
      .then((quizzes) => {
        return new Promise((resolve, reject) => resolve(this.shuffleQuizzes(quizzes)));
      })
      .catch((error) => console.error(error));
  }

  shuffleQuizzes(quizzes) {
    const shuffledQuizzes = [];

    // todo: remove
    randomQuizzes.length = 0;

    for (let i = 0; i < 5; i++) {
      let randomNumber = Math.floor(Math.random() * quizzes.length);
      let randomQuiz = quizzes[randomNumber];
      
      // todo: remove
      randomQuizzes.push(randomQuiz);

      shuffledQuizzes.push(randomQuiz);
      quizzes.splice(randomNumber, 1);
    }

    return shuffledQuizzes;
  }

  checkUserAnswer(answer, index, quizzes) {
    let isCorrect = false;

    switch (quizzes[index].type) {
      case 'radio':
        answer ? answer.value === quizzes[index].correctAnswer ? isCorrect = true : null : null;
        break;
      case 'input':
        answer.value === quizzes[index].correctAnswer ? isCorrect = true : null;
        break;
      case 'checkbox':
        this.areArraysEqual(answer, quizzes[index].correctAnswer) ? isCorrect = true : null;
        break;
      case 'multi-input':
        // todo: implement multi-input quizzes
    }

    quizzes[index].isCorrect = isCorrect;

    return isCorrect;
  }

  areArraysEqual(arr1, arr2) {
    arr1.sort();
    arr2.sort();
  
    if (arr1.length !== arr2.length) {
      return false;
    }
  
    for (var i = arr1.length; i--;) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
  
    return true;
  }
}

class SwiperHandler {
  constructor() {
    this.instance = null;
  }

  initSwiper() {
    this.instance = new Swiper('.swiper-container', {
      direction: 'horizontal',
      loop: false,
      pagination: {
        el: '.swiper-custom-pagination',
        bulletClass: 'swiper-pagination-bullet'
      },
    });
  }
  
  destroySwiper() {
    this.swiperExists() ? this.instance.destroy() : null;
  }
  
  swiperExists() {
    return this.instance !== null;
  }
}

let randomQuizzes = [];
let currentQuizIndex = 0; // Current card
let quizName = 'js'; // default quiz

function showTab(n) {
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";

  fixStepIndicator(n)
}

function toggleVisibility(element) {
  element.classList.toggle('hide');
}

function submitAnswer() {
  // stop timebar
  let event = new Event('answerIsSubmitted');
  document.dispatchEvent(event);

  toggleVisibility(document.querySelector('#submitButton'));

  var x = document.getElementById('quiz-card');
  var tabs = document.getElementsByClassName("tab");

  checkAnswer();

  x.classList.add("removed-item");
  x.classList.remove("new-item");

  setTimeout(function () {
    // Hide the current tab:
    tabs[currentQuizIndex].style.display = "none";

    // Increase or decrease the current tab by 1:
    currentQuizIndex = ++currentQuizIndex;

    // if you have reached the end of the form...
    if (currentQuizIndex >= tabs.length) {
      showResult();
      return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentQuizIndex);

    x.classList.add("new-item");
    x.classList.remove("removed-item");
    toggleVisibility(document.querySelector('#submitButton'));

    // call event to start timebar
    let event = new Event('newCardIsShown');
    document.dispatchEvent(event);
  }, 2000);
}

function checkAnswer() {
  var x, answer, isCorrect = false;
  x = document.getElementsByClassName("tab");

  switch (randomQuizzes[currentQuizIndex].type) {
    case 'radio':
      answer = x[currentQuizIndex].querySelector('input[name=answer]:checked');
      answer ? answer.value === randomQuizzes[currentQuizIndex].correctAnswer ? isCorrect = true : null : null;
      break;
    case 'input':
      answer = x[currentQuizIndex].querySelector('input');
      answer.value === randomQuizzes[currentQuizIndex].correctAnswer ? isCorrect = true : null;
      break;
    case 'checkbox':
      answers = x[currentQuizIndex].querySelectorAll('input[name=answer]:checked');
      answers = [].map.call(answers, (e) => e.value);
      arraysEqual(answers, randomQuizzes[currentQuizIndex].correctAnswer) ? isCorrect = true : null;
      break;
    case 'multi-input':
      answers = x[currentQuizIndex].querySelectorAll('input');
      answers = [].map.call(answers, (e) => e.value);
    // todo: implement multi-input quizzes
  }

  randomQuizzes[currentQuizIndex].isCorrect = isCorrect;

  if (isCorrect) {
    document.getElementsByClassName("step")[currentQuizIndex].classList.add("correct");
  } else {
    document.getElementsByClassName("step")[currentQuizIndex].classList.add("wrong");
  }

  return isCorrect; // return isCorrect status
}

function fixStepIndicator(n = null) {
  // This function removes the "active" class of all steps...
  let steps = Array.from(document.getElementsByClassName("step"));

  steps.forEach((el) => el.classList.remove("active"));

  //... and adds the "active" class on the current step:
  n === null ? null : steps[n].classList.add("active");
}

function arraysEqual(arr1, arr2) {
  arr1.sort();
  arr2.sort();

  if (arr1.length !== arr2.length) {
    return false;
  }

  for (var i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

function buildQuiz(rawQuiz) {
  var template;

  switch (rawQuiz.type) {
    case 'checkbox':
    case 'radio':
      template =
        `<div class="tab">
        <h4>${rawQuiz.question ? rawQuiz.question : ''}</h4>
        <div class="description">${rawQuiz.description ? rawQuiz.description : ''}</div>
        <br>
        ${choiceBuilder(rawQuiz.type, rawQuiz.choices)}
      </div>`;
      break;
    case 'input':
      template =
        `<div class="tab">
        <h4>${rawQuiz.question ? rawQuiz.question : ''}</h4>
        <div class="description">${rawQuiz.description ? rawQuiz.description : ''}</div>
        <br>
        <div class="input-container"><input class="input" maxlength="${rawQuiz.correctAnswer.length}"></div>
      </div>`;
      break;
  }

  return template;
}

function choiceBuilder(type, choices) {
  return choices.map((type => choice =>
    `<div class="${type}">
      <label><input type="${type}" name="answer" value="${choice}">${choice}</label>
    </div>`)(type)).join('');
}

function buildCorrectQuizCard(quiz) {
  var template;

  switch (quiz.type) {
    case 'checkbox':
    case 'radio':
      template =
        `<div class="swiper-slide">
        <div class="card">
          <h4>${quiz.question ? quiz.question : ''}</h4>
          <div>${quiz.description ? quiz.description : ''}</div>
          <br>
          ${choiceBuilder(quiz.type, quiz.choices)}
        </div>
      </div>`;
      break;
    case 'input':
      template =
        `<div class="swiper-slide">
        <div class="card">
          <h4>${quiz.question ? quiz.question : ''}</h4>
          <div>${quiz.description ? quiz.description : ''}</div>
          <br>
          <div class="input-container"><input class="input" value="${quiz.correctAnswer}"></div>
        </div>
      </div>`;
      break;
  }

  return template;
}

function showResult() {
  toggleVisibility(document.querySelector('#quiz'));
  document.querySelector('#result-card').classList.remove('hide');

  document.querySelector('#result').innerHTML = randomQuizzes.filter(quiz => {
    return quiz.isCorrect;
  }).length + '/5';

  document.querySelector('.swiper-wrapper').innerHTML = randomQuizzes.map(buildCorrectQuizCard).join('');

  document.querySelector('#timeBar').classList.add('remove-time');
  fixStepIndicator();
}