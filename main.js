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
    this.menuSections = document.getElementsByClassName("overlay__content");
    this.indicators = document.getElementsByClassName('indicator');
    this.quizLabel = document.getElementById("quizLabel");
    this.quizDescription = document.getElementById('description')
    this.countdownElement = document.getElementById("countdown");
    this.quiz = document.getElementById('quiz');
    this.quizCard = document.getElementById('quiz-card');
    this.resultCard = document.getElementById('result-card');
    this.result = document.getElementById('result');
    this.swiperWrapper = document.querySelector('.swiper-wrapper');
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

  getUserAnswer(quizType) {
    switch (quizType) {
      case 'radio':
        return this.quizCard.querySelector('input[name=answer]:checked');
      case 'input':
        return this.quizCard.querySelector('input');
      case 'checkbox':
        return Array.from(this.quizCard.querySelectorAll('input[name=answer]:checked')).map((e) => e.value);
      case 'multi-input':
        // todo: implement multi-input quizzes
        return Array.from(this.quizCard.querySelectorAll('input')).map((e) => e.value);
      default:
        throw new Error('Unknown quiz type.');
    }
  }

  countdown() {
    return new Promise((resolve, reject) => {
      let counter = 3;

      let countInterval = setInterval(() => {
        this.countdownElement.innerHTML = counter--;
        if (counter === -1) {
          clearInterval(countInterval);
          this.countdownElement.innerHTML = "";

          this.toggleVisibility(this.quiz);

          resolve();
        };
      }, 700)
    });
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

  *initQuizGenerator() {
    for (let quiz of this.quizzes) {
      yield quiz;
    }
  }

  hideSubmitButton() {
    this.toggleVisibility(this.submitButton);
  }

  renderNextQuiz() {
    let quiz = this.quizGenerator.next();

    return new Promise((resolve, reject) => {
      if (!quiz.done) {
        this.quizCard.innerHTML = quiz.value;
        this.quizCard.classList.add("new-item");
        this.quizCard.classList.remove("removed-item");
        resolve(true);
      } else {
        resolve(false);
      }

      this.toggleVisibility(this.submitButton);
    });
  }

  hideCard() {
    return new Promise((resolve, reject) => {
      this.quizCard.classList.add("removed-item");
      this.quizCard.classList.remove("new-item");
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  showIsCorrect(currentQuizIndex, isCorrect = true) {
    if (isCorrect) {
      this.indicators[currentQuizIndex].classList.add("correct");
    } else {
      this.indicators[currentQuizIndex].classList.add("wrong");
    }
  }

  setQuizzes(quizzesWithLayout) {
    this.quizzes = quizzesWithLayout;

    this.quizGenerator = this.initQuizGenerator();
  }

  restart() {
    this.quizzes.length = 0;
    document.querySelector('.swiper-custom-pagination').classList.add('hide');
    document.querySelector('#answers').classList.add('hide');
    document.querySelector('#quiz-indicators').classList.remove('hide');
    this.resultCard.classList.add('hide');
    let indicators = document.querySelectorAll('#quiz-indicators > .indicator');
    [].map.call(indicators, (e) => e.className = 'indicator');
    document.querySelector("#description").classList.remove('remove-scale');
    this.toggleVisibility(document.querySelector('#description > button'));
    this.toggleVisibility(document.querySelector('#submitButton'));
    document.querySelector('#timeBar').classList.remove('remove-time');
    document.getElementById('quiz-card').classList.remove("removed-item");
    this.swiperHandler.destroySwiper();
  }

  viewAnswers() {
    this.resultCard.classList.add('hide');
    document.querySelector('#quiz-indicators').classList.add('hide');
    document.querySelector('#answers').classList.remove('hide');
    document.querySelector('.swiper-custom-pagination').classList.remove('hide');
    this.swiperHandler.initSwiper();
  }

  showResult(numberOfCorrectAnswers, cardsWithAnswers) {
    this.toggleVisibility(this.quiz);
    this.resultCard.classList.remove('hide');

    this.result.innerHTML = numberOfCorrectAnswers + '/5';

    this.swiperWrapper.innerHTML = cardsWithAnswers;

    this.timebar.classList.add('remove-time');
  }
}

class Game {
  constructor() {
    this.numberOfQuizzes = 5;
    this.currentQuizIndex = 0;
    this.quizTime = 40;
    this.quizType = 'js';
    this.quizNames = Object.assign({}, QUIZ_NAMES);
    this.quizzes = [];
  }

  getCurrentQuizIndex() {
    return this.currentQuizIndex;
  }

  incrementCurrentQuizIndex() {
    this.currentQuizIndex++;
  }

  getCurrentQuizType() {
    return this.quizzes[this.currentQuizIndex].type;
  }

  setQuizType(quizType) {
    this.quizType = quizType;

    return this.quizNames[quizType];
  }

  setQuizzes(quizzes) {
    this.quizzes = quizzes;
  }

  getQuizzes() {
    return this.quizzes;
  }

  getNumberOfCorrectAnswers() {
    return this.quizzes.filter(quiz => quiz.isCorrect).length;
  }

  restart() {
    this.currentQuizIndex = 0;
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
    this.ui.renderNextQuiz();
    this.ui.countdown().then(() => this.ui.startTimer());
  }

  submitAnswer() {
    let event = new Event('answerIsSubmitted');
    document.dispatchEvent(event);

    this.ui.hideSubmitButton();
    let answer = this.ui.getUserAnswer(this.game.getCurrentQuizType());
    let index = this.game.getCurrentQuizIndex();
    let isCorrect = this.quizService.checkUserAnswer(answer, index, this.game.getQuizzes());
    this.ui.showIsCorrect(index, isCorrect);

    this.ui.hideCard()
      .then(() => this.ui.renderNextQuiz())
      .then(result => {
        if (result) {
          this.game.incrementCurrentQuizIndex();
          let event = new Event('newCardIsShown');
          document.dispatchEvent(event);
        } else {
          this.ui.showResult(this.game.getNumberOfCorrectAnswers(), this.quizService.getQuizzesWithLayout(this.game.getQuizzes()));
        }
      });
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

  setQuizType(quizType) {
    const quizLabel = this.game.setQuizType(quizType)
    this.ui.setQuizLabel(quizLabel);
  }

  restart() {
    this.ui.restart();
    this.game.restart();

    this.loadQuizzesByType(this.game.quizType);
  }

  loadQuizzesByType(quizType) {
    this.setQuizType(quizType);
    this.quizService.loadQuizzes(this.game.quizType).then((randomQuizzes) => {
      this.game.setQuizzes(randomQuizzes);
      this.ui.setQuizzes(randomQuizzes.map(this.quizService.buildQuiz.bind(this.quizService)));
    });
  }

  viewAnswers() {
    this.ui.viewAnswers();
  }
}

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

    for (let i = 0; i < 5; i++) {
      let randomNumber = Math.floor(Math.random() * quizzes.length);
      let randomQuiz = quizzes[randomNumber];

      shuffledQuizzes.push(randomQuiz);
      quizzes.splice(randomNumber, 1);
    }

    return shuffledQuizzes;
  }

  checkUserAnswer(answer, index, quizzes) {
    let isCorrect = false;

    switch (quizzes[index].type) {
      case 'radio':
        isCorrect = answer ? +answer.value === quizzes[index].correctAnswer : false;
        break;
      case 'input':
        isCorrect = answer ? answer.value === quizzes[index].correctAnswer : false;
        break;
      case 'checkbox':
        isCorrect = this.areArraysEqual(answer, quizzes[index].correctAnswer);
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

    for (let i = arr1.length; i--;) {
      if (+arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  }

  getQuizzesWithLayout(quizzes) {
    return quizzes.map(this.buildCorrectQuizCard.bind(this))
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
    return choices.map(
      (type => (choice, index) =>
      `<div class="${type}">
        <label>
          <input type="${type}" name="answer" value="${index}">${this._htmlEntities(choice)}
        </label>
      </div>`)(type)
    ).join('');
  }

  buildCorrectQuizCard(quiz) {
    return `<div class="swiper-slide">
              <div class="card">
                ${this.buildQuiz(quiz)}
              </div>
            </div>`;
  }

  _htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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

function eventListeners() {
  const ui = new UI;
  const game = new Game;
  const quizService = new QuizService();
  const controller = new Controller(ui, game, quizService);

  ui.startButton.onclick = () => controller.start();
  ui.submitButton.onclick = () => controller.submitAnswer();
  ui.menuButton.addEventListener('click', () => controller.toggleMenu());
  ui.closeMenuButton.onclick = () => controller.toggleMenu();
  ui.viewAnswersButton.onclick = () => controller.viewAnswers();
  document.body.onkeyup = (e) => e.key === "Escape" ? controller.toggleMenu() : null;
  document.addEventListener('timeout', () => controller.submitAnswer());
  document.addEventListener('answerIsSubmitted', () => controller.stopTimer());
  document.addEventListener('newCardIsShown', () => controller.startTimer());

  ui.quizTypes.forEach((value) => {
    value.onclick = controller.loadQuizzesByType.bind(controller, value.getAttribute('data-quiz-type'));
  });

  ui.menuLinks.forEach((value) => {
    value.onclick = () => ui.openLink(value.dataset.menu);
  });

  ui.restartButtons.forEach((value) => {
    value.onclick = () => controller.restart();
  });

  controller.loadQuizzesByType('js');
}

document.addEventListener('DOMContentLoaded', eventListeners);