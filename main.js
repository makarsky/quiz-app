const QUIZ_NAMES = {
  'js': 'JavaScript',
  'java': 'Java',
  'php': 'PHP',
  'sql': 'SQL'
};

class UI {
  constructor() {
    this.menuButton = document.getElementById('menuButton');
    this.closeMenuButton = document.getElementById('closeMenuButton');
    this.startButton = document.getElementById('startButton');
    this.submitButton = document.getElementById('submitButton');
    this.navigation = document.getElementById("navigation");
    this.menuSections = document.getElementsByClassName("overlay-content");
    this.quizLabel = document.getElementById("quizLabel");
    this.quizTypes = Array.from(document.getElementsByClassName("quiz-type"));
    this.menuLinks = Array.from(document.getElementsByClassName("menu-link"));
    this.restartButtons = Array.from(document.getElementsByClassName('restart'));
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

  setQuizLabel(quizLabel) {
    this.quizLabel.innerHTML = quizLabel;
    this.closeMenu();
  }
  
  addQuizzes(randomQuizzes) {
    var card = document.getElementById("regForm");
    card.innerHTML = randomQuizzes.map(buildQuiz).join('');

    showTab(currentQuizIndex); // Show the current card
  }

  restart() {
    document.querySelector('.swiper-custom-pagination').classList.add('hide');
    document.querySelector('#answers').classList.add('hide');
    document.querySelector('#challenge-steps').classList.remove('hide');
    document.querySelector('#result-card').classList.add('hide');
    let steps = document.querySelectorAll('#challenge-steps > .step');
    [].map.call(steps, (e) => e.className = 'step');
    document.querySelector("#description").classList.remove('remove-scale');
    toggleVisibility(document.querySelector("#description"));
    toggleVisibility(document.querySelector('#description > button'));
    toggleVisibility(document.querySelector('#submitButton'));
    document.querySelector('#timeBar').classList.remove('remove-time');
    document.getElementById('regForm').classList.remove("removed-item");
  }
}

class Game {
  constructor() {
    this.quizTime = 40;
    this.quizType = 'js';
    this.quizNames = Object.assign({}, QUIZ_NAMES);
    this.randomQuizzes = [];
  }

  setQuizType(quizType) {
    this.quizType = quizType;
    // TODO: remove the statement below, when refactoring is finished.
    quizName = quizType;

    return this.quizNames[quizType];
  }

  loadQuizzes() {
    return fetch(`quizzes/${quizName}.json`)
      .then((result) => result.json())
      .then((quizzes) => {
        return new Promise((resolve, reject) => resolve(this.shuffleQuizzes(quizzes)));
      })
      .catch((error) => console.error(error));
  }

  shuffleQuizzes(quizzes) {
    // TODO: remove after refactoring
    randomQuizzes = [];
    this.randomQuizzes = [];

    for (var i = 0; i < 5; i++) {
      var randomNumber = Math.floor(Math.random() * quizzes.length);
  
      var randomQuiz = quizzes[randomNumber];
      // TODO: remove after refactoring
      randomQuizzes.push(randomQuiz);
      this.randomQuizzes.push(randomQuiz);
      quizzes.splice(randomNumber, 1);
    }

    return this.randomQuizzes;
  }

  restart() {
    swiperHandler.destroySwiper();
    currentQuizIndex = 0;
    timer = null;

    return this.loadQuizzes();
  }
}

class Controller {
  constructor(ui, game) {
    this.ui = ui;
    this.game = game;
  }

  toggleMenu() {
    this.ui.toggleMenu();
  }

  setQuizType(quizType) {
    const quizLabel = this.game.setQuizType(quizType)
    this.ui.setQuizLabel(quizLabel);
    this.game.loadQuizzes().then((randomQuizzes) => this.ui.addQuizzes(randomQuizzes));
  }

  restart() {
    this.ui.restart();
    this.game.restart().then((randomQuizzes) => this.ui.addQuizzes(randomQuizzes));
  }
}

function eventListeners() {
  const ui = new UI;
  const game = new Game;
  const controller = new Controller(ui, game);
  
  ui.startButton.onclick = start;
  ui.submitButton.onclick = submitAnswer;
  ui.menuButton.addEventListener('click', () => controller.toggleMenu());
  ui.closeMenuButton.onclick = () => controller.toggleMenu();
  document.body.onkeyup = (e) => e.key === "Escape" ? controller.toggleMenu() : null;

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
const quizTime = 40; // Quiz time in seconds
let currentQuizIndex = 0; // Current card
let timer = null;
let quizName = 'js'; // default quiz
const swiperHandler = new SwiperHandler;
var description = document.getElementById('description');
description.addEventListener('webkitAnimationEnd', (event) => toggleVisibility(description), false);

function showTab(n) {
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";

  fixStepIndicator(n)
}

function toggleVisibility(element) {
  element.classList.toggle('hide');
}

function submitAnswer(e) {
  toggleVisibility(e.target);
  clearInterval(timer);

  var x = document.getElementById("regForm");
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
    toggleVisibility(e.target);
    move();
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
  let x = document.getElementsByClassName("step");

  for (let i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }

  //... and adds the "active" class on the current step:
  n === null ? null : x[n].classList.add("active");
}

function move() {
  var timeBar = document.getElementById("timeBar");
  timeBar.style.width = '100%';
  var quizTimeCopy = quizTime;

  timer = setInterval(frame, 5);

  function frame() {
    if (quizTimeCopy <= 0) {
      clearInterval(timer);
      submitAnswer({target: document.querySelector('#submitButton')});
    } else {
      quizTimeCopy -= 0.005

      width = quizTimeCopy / quizTime * 100;
      timeBar.style.width = width + '%';
    }
  }
}

function toggleMenu() {
  openLink('menu');
  document.getElementById("navigation").classList.toggle("overlay-opened");
}

function openLink(id) {
  var menuSections = document.getElementsByClassName("overlay-content");
  [].forEach.call(menuSections, (e) => e.style.display = "none");
  document.getElementById(id).style.display = "block";
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
  switch (type) {
    case 'checkbox':
      return choices.map((type => choice =>
        `<div class="checkbox">
          <label><input type="checkbox" name="answer" value="${choice}">${choice}</label>
        </div>`)(type)).join('');
    case 'radio':
      return choices.map((type => choice =>
        `<div class="radio">
          <label><input type="radio" name="answer" value="${choice}">${choice}</label>
        </div>`)(type)).join('');
  }
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

function countdown() {
  let counter = 3;
  let element = document.querySelector("#countdown");
  
  let countInterval = setInterval(() => {
    element.innerHTML = counter--;
    if (counter === -1) {
      clearInterval(countInterval);
      element.innerHTML = "";

      toggleVisibility(document.querySelector('#quiz'));
      move();
    };
  }, 700)
}

function start() {
  let element = document.querySelector('#description');
  toggleVisibility(document.querySelector('#description > button'));
  element.classList.toggle('remove-scale');
  
  countdown();
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

function viewAnswers() {
  document.querySelector('#result-card').classList.add('hide');
  document.querySelector('#challenge-steps').classList.add('hide');
  document.querySelector('#answers').classList.remove('hide');
  document.querySelector('.swiper-custom-pagination').classList.remove('hide');
  swiperHandler.initSwiper();
}