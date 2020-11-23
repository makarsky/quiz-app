const QUIZ_CATEGORIES = [
  {category: 'js', title: 'JavaScript'},
  {category: 'java', title: 'Java'},
  {category: 'php', title: 'PHP'},
  {category: 'sql', title: 'SQL (MySQL)'},
  {category: 'css', title: 'CSS'},
  {category: 'bash', title: 'Bash'},
  {category: 'dart', title: 'Dart'}
];

const SUPPORTED_QUIZ_TYPES = [
  'input',
  'radio',
  'checkbox',
  'multi-input'
];

class UI {
  constructor() {
    this.quizzes = [];
    this.quizGenerator = null;
    this.menuButton = document.getElementById('menuButton');
    this.closeMenuButton = document.getElementById('closeMenuButton');
    this.startButton = document.getElementById('startButton');
    this.submitButton = document.getElementById('submitButton');
    this.navigation = document.getElementById('navigation');
    this.menuSections = document.getElementsByClassName('overlay__content');
    this.indicators = document.getElementsByClassName('indicator');
    this.quizLabel = document.getElementById('quiz-label');
    this.quizDescription = document.getElementById('quiz-description');
    this.countdownElement = document.getElementById('countdown');
    this.quiz = document.getElementById('quiz');
    this.quizCard = document.getElementById('quiz-card');
    this.resultCard = document.getElementById('result-card');
    this.result = document.getElementById('result');
    this.swiperWrapper = document.querySelector('.swiper-wrapper');
    this.viewAnswersButton = document.getElementById('view-answers');
    this.quizCategories = Array.from(document.getElementsByClassName('quiz-category'));
    this.menuLinks = Array.from(document.getElementsByClassName('menu-link'));
    this.restartButtons = Array.from(document.getElementsByClassName('restart'));
    this.timebar = document.getElementById('timeBar');
    this.loader = document.getElementById('loader');
    this.timer = new Timer(this.timebar);
    this.swiperHandler = new SwiperHandler;
    this.hideDescriptionTimeout = null;
    this.hideCardTimeout = null;
    this.renderNextQuizTimeout = null;
    this.countInterval = null;
    this.loaderTimeout = null;
  }

  showElement(element) {
    element.classList.remove('hidden');
  }

  hideElement(element) {
    element.classList.add('hidden');
  }

  showLoader() {
    // Timeout in case Github is down.
    this.loaderTimeout = setTimeout(
      () => this.showElement(this.loader),
      1000
    );
  }

  hideLoader() {
    clearTimeout(this.loaderTimeout);
    this.hideElement(this.loader);
  }

  toggleMenu() {
    this.openLink('menu');
    this.navigation.classList.toggle('overlay--opened');
  }

  closeMenu() {
    this.openLink('menu');
    this.navigation.classList.remove('overlay--opened');
  }

  openLink(id) {
    [].forEach.call(this.menuSections, (e) => e.style.display = "none");
    document.getElementById(id).style.display = "block";
  }

  hideDescription() {
    return new Promise((resolve) => {
      this.hideStartButton();
      this.quizDescription.firstChild.classList.toggle('remove-scale');
      this.hideDescriptionTimeout = setTimeout(() => {
        this.quizDescription.classList.add('hidden');
        resolve(true);
      }, 400);
    });
  }

  getUserAnswer(quizType) {
    let answer = false, element = null, values = [];

    switch (quizType) {
      case 'radio':
        element = this.quizCard.querySelector('input:checked');
        answer = element ? +element.value : false;
        break;
      case 'input':
        element = this.quizCard.querySelector('input');
        answer = element && element.value.length !== 0
          ? element.value.trim()
          : false;
        break;
      case 'checkbox':
        values = Array.from(this.quizCard.querySelectorAll('input:checked'))
          .map((e) => +e.value);
        answer = values.length !== 0 ? values : false;
        break;
      case 'multi-input':
        values = Array.from(this.quizCard.querySelectorAll('input'))
          .map((e) => e.value.trim());
        answer = values.includes('') ? false : values;
        break;
      default:
        throw new Error('Unknown quiz type.');
    }

    return answer;
  }

  showEmptyAnswerAnimation(quizType) {
    let elements = [];

    switch (quizType) {
      case 'input':
        elements.push(this.quizCard.querySelector('.input-sizer'));
        break;
      case 'radio':
      case 'checkbox':
        Array.from(this.quizCard.querySelectorAll('input ~ .choice-icon'))
          .forEach((e) => elements.push(e));
        break;
      case 'multi-input':
        Array.from(this.quizCard.querySelectorAll('.input-sizer'))
          .forEach((e) => {
            if (e.querySelector('input').value.length === 0) {
              elements.push(e);
            }
          });
        break;
      default:
        throw new Error('Unknown quiz type.');
    }

    elements.forEach((e) => {
      e.classList.add('shake');
      e.addEventListener('animationend', () =>
        e.classList.remove('shake')
      );
    });
  }

  countdown() {
    return new Promise((resolve, reject) => {
      let counter = 3;
      this.countdownElement.innerHTML = counter--;
      this.countdownElement.classList.remove('hidden');

      this.countInterval = setInterval(() => {
        this.countdownElement.innerHTML = counter--;

        if (counter === -1) {
          clearInterval(this.countInterval);
          this.countdownElement.classList.add('hidden');

          this.showElement(this.quiz);

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
    this.submitButton.classList.add('submit--hidden');
  }

  showSubmitButton() {
    this.submitButton.classList.remove('submit--hidden');
  }

  hideStartButton() {
    this.startButton.classList.add('submit--hidden');
  }

  showStartButton() {
    this.startButton.classList.remove('submit--hidden');
  }

  hideRestartButton() {
    this.submitButton.classList.add('submit--hidden');
  }

  showRestartButton() {
    this.submitButton.classList.remove('submit--hidden');
  }

  renderNextQuiz() {
    let quiz = this.quizGenerator.next();

    return new Promise((resolve, reject) => {
      if (!quiz.done) {
        this.quizCard.innerHTML = quiz.value;
        
        // Sets autofocus
        // const input = this.quizCard.querySelector('input');
        // if (input) {
        //   input.focus();
        // }

        this.quizCard.classList.add('new-item');
        this.quizCard.classList.remove('removed-item');
        this.quizCard.classList.remove('card--correct');
        this.quizCard.classList.remove('card--wrong');

        window.scrollTo(0, 0);

        // Timeout is for waiting card animation
        this.renderNextQuizTimeout = setTimeout(() => resolve(true), 500);
      } else {
        resolve(false);
      }
    });
  }

  hideCard() {
    return new Promise((resolve, reject) => {
      this.quizCard.classList.add('removed-item');
      this.quizCard.classList.remove('new-item');
      this.hideCardTimeout = setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  showIsCorrect(currentQuizIndex, isCorrect = true) {
    if (isCorrect) {
      this.indicators[currentQuizIndex].classList.add('indicator--correct');
      this.quizCard.classList.add('card--correct');
    } else {
      this.indicators[currentQuizIndex].classList.add('indicator--wrong');
      this.quizCard.classList.add('card--wrong');
    }
  }

  setQuizzes(quizzesWithLayout) {
    this.quizzes = quizzesWithLayout;

    this.quizGenerator = this.initQuizGenerator();
  }

  _clearTimeouts() {
    clearTimeout(this.renderNextQuizTimeout);
    clearTimeout(this.hideCardTimeout);
    clearTimeout(this.hideDescriptionTimeout);
    clearInterval(this.countInterval);
    clearTimeout(this.loaderTimeout);
  }

  restart() {
    this._clearTimeouts();
    this.quizzes.length = 0;
    document.querySelector('.swiper-custom-pagination').classList.add('hidden');
    document.querySelector('#answers').classList.add('hidden');
    document.querySelector('#quiz-indicators').classList.remove('hidden');
    this.countdownElement.classList.add('hidden');
    this.resultCard.classList.add('hidden');
    let indicators = document.querySelectorAll('#quiz-indicators > .indicator');
    [].map.call(indicators, (e) => e.className = 'indicator');
    this.quizDescription.firstChild.classList.remove('remove-scale');
    this.quizDescription.classList.remove('hidden');
    this.showStartButton();
    document.getElementById('quiz-card').classList.remove("removed-item");
    this.swiperHandler.destroySwiper();
  }

  viewAnswers(quizzesWithAnswers) {
    this.resultCard.classList.add('hidden');
    document.querySelector('#quiz-indicators').classList.add('hidden');
    document.querySelector('#answers').classList.remove('hidden');
    document.querySelector('.swiper-custom-pagination').classList.remove('hidden');
    this.swiperHandler.initSwiper();

    Array.from(document.querySelectorAll('.swiper-custom-pagination > .indicator'))
      .forEach((e, i) => {
        quizzesWithAnswers[i].isCorrect
          ? e.classList.add('indicator--correct')
          : e.classList.add('indicator--wrong');
      });
  }

  showResult(numberOfCorrectAnswers, cardsWithAnswers) {
    this.hideElement(this.quiz);
    this.resultCard.classList.remove('hidden');

    this.result.innerHTML = numberOfCorrectAnswers + '/5';

    this.swiperWrapper.innerHTML = cardsWithAnswers.join('');
  }
}

class Game {
  constructor() {
    this.numberOfQuizzes = 5;
    this.currentQuizIndex = 0;
    this.quizCategory = null;
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

  setQuizCategory(quizCategory) {
    this.quizCategory = quizCategory;
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
    this.quizService = quizService;
    this.isSubmittingAnswer = false;
  }

  async start() {
    this.ui.hideSubmitButton();
    await this.ui.hideDescription();
    await this.ui.countdown();
    await this.ui.renderNextQuiz();
    this.ui.startTimer();
    this.ui.showSubmitButton();
  }

  async submitAnswer(byUser) {
    if (this.isSubmittingAnswer) {
      return;
    }

    this.isSubmittingAnswer = true;

    let answer = this.ui.getUserAnswer(this.game.getCurrentQuizType());

    if (answer === false && byUser) {
      this.ui.showEmptyAnswerAnimation(this.game.getCurrentQuizType());
      this.isSubmittingAnswer = false;
      return;
    }

    window.scrollTo(0, 0);
    this.stopTimer();
    this.ui.hideSubmitButton();

    let index = this.game.getCurrentQuizIndex();
    let isCorrect = this.quizService.checkUserAnswer(answer, index, this.game.getQuizzes());
    this.ui.showIsCorrect(index, isCorrect);

    await this.ui.hideCard();
    let result = await this.ui.renderNextQuiz();

    if (result) {
      this.game.incrementCurrentQuizIndex();
      this.startTimer()
      this.ui.showSubmitButton();
    } else {
      this.ui.showResult(
        this.game.getNumberOfCorrectAnswers(),
        this.quizService.getQuizzesWithLayout(this.game.getQuizzes())
      );
    }

    this.isSubmittingAnswer = false;
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

  setQuizCategory(quizCategory, quizTitle) {
    this.game.setQuizCategory(quizCategory)

    if (quizTitle) {
      this.ui.setQuizLabel(quizTitle);
    }
  }

  restart() {
    this.loadQuizzesByType(this.game.quizCategory);
  }

  loadQuizzesByType(quizCategory, quizTitle) {
    this.stopTimer();
    this.ui.hideElement(this.ui.quiz);
    this.ui.restart();
    this.game.restart();
    this.ui.showLoader();

    this.setQuizCategory(quizCategory, quizTitle);
    this.quizService.loadQuizzes(this.game.quizCategory).then((randomQuizzes) => {
      this.game.setQuizzes(randomQuizzes);
      this.ui.setQuizzes(randomQuizzes.map(
        this.quizService.buildQuiz.bind(this.quizService))
      );
      this.ui.hideLoader();
    });
  }

  viewAnswers() {
    this.ui.viewAnswers(this.game.getQuizzes());
  }
}

class Timer {
  constructor(timeBarDOMElement) {
    this.timeBar = timeBarDOMElement;
    this.quizTime = 40;
    this.timerTimeout = null;
  }

  start() {
    this.timeBar.classList.remove('invisible');
    this.timeBar.classList.add('timer-animation');

    const frame = () => {
      const timerEvent = document.createEvent('Event');
      timerEvent.initEvent('timeout', false, false);
      document.dispatchEvent(timerEvent);
    }

    this.timerTimeout = setTimeout(frame, this.quizTime * 1000);
  }

  stop() {
    let width = this.timeBar.getBoundingClientRect().width;
    this.timeBar.classList.remove('timer-animation');
    this.timeBar.style.width = width + 'px';
    this.timeBar.classList.add('invisible');
    clearTimeout(this.timerTimeout);
  }
}

class QuizService {
  loadQuizzes(quizName) {
    return fetch(`quizzes/${quizName}.json`)
      .then((result) => result.json())
      .then((quizzes) => quizzes.filter(q => SUPPORTED_QUIZ_TYPES.includes(q.type)))
      .then((quizzes) => {
        if (quizzes.length < 5) {
          throw new Error('There are not enough quizzes');
        }
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

    if (answer !== false) {
      switch (quizzes[index].type) {
        case 'radio':
          isCorrect = answer === quizzes[index].correctAnswer;
          break;
        case 'input':
          isCorrect = answer.toLowerCase() === quizzes[index].correctAnswer.toLowerCase();
          break;
        case 'checkbox':
          isCorrect = this.areArraysEqual(answer, quizzes[index].correctAnswer, true);
          break;
        case 'multi-input':
          isCorrect = this.areArraysEqual(
            answer.map(a => a.toLowerCase()),
            quizzes[index].correctAnswer.map(a => a.toLowerCase()),
            false
          );
          break;
      }
    }

    quizzes[index].isCorrect = isCorrect;

    return isCorrect;
  }

  areArraysEqual(arr1, arr2, useSorting) {
    if (useSorting) {
      arr1.sort();
      arr2.sort();
    }

    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = arr1.length; i--;) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  }

  getQuizzesWithLayout(quizzes) {
    return quizzes.map(this.buildCorrectQuizCard.bind(this))
  }

  buildQuiz(rawQuiz, rawQuizIndex, rawQuizzes, showAnswer) {
    const question = `<h4>${rawQuiz.question ? this._htmlEntities(rawQuiz.question) : ''}</h4>`;
    let description = '', inputs = '', madeBy = '';

    if (rawQuiz.madeBy) {
      madeBy = `<div class="made-by">by ${
        this._htmlEntities(rawQuiz.madeBy)
      }</div>`;
    }

    switch (rawQuiz.type) {
      case 'checkbox':
      case 'radio':
        description = `<div class="description">${rawQuiz.description
          ? this._htmlEntities(rawQuiz.description) : ''}</div>`;
        inputs = this._buildChoices(rawQuiz, rawQuizIndex, showAnswer);
        break;
      case 'input':
        description = `<div class="description">${rawQuiz.description
          ? this._htmlEntities(rawQuiz.description) : ''}</div>`;
        inputs = this._buildInput(rawQuiz, showAnswer);
        break;
      case 'multi-input':
        description = this._buildMultiInputDescription(rawQuiz, showAnswer);
        break;
    }

    return question + description + madeBy + inputs;
  }

  _buildChoices(rawQuiz, rawQuizIndex, showAnswer) {
    const choices = rawQuiz.choices.map(
      ((type, correctAnswer, showAnswer) => (rawChoice, index) =>
        `<label class="input-label">
            <div>
              <input type="${type}"
                name="answer${rawQuizIndex}"
                value="${index}"
                ${showAnswer ? (
                  typeof correctAnswer === 'number'
                    ? (index === correctAnswer ? 'checked' : '')
                    : (correctAnswer.includes(index) ? 'checked' : '')
                ) : ''}
                ${showAnswer ? 'disabled' : ''}
              >
              <div class="choice-icon ${type}-icon"></div>
            </div>
            <div>${this._htmlEntities(rawChoice)}</div>
          </label>`)(rawQuiz.type, rawQuiz.correctAnswer, showAnswer)
    );
    this.shuffleChoices(choices);

    return `<div class="choices-container">${choices.join('')}</div>`;
  }

  _buildInput(rawQuiz, showAnswer) {
    return `<div class="input-container">
      <label class="input-sizer">
        <input type="text"
          onInput="this.parentNode.dataset.value = this.value"
          size="6"
          placeholder="Answer"
          value="${showAnswer ? rawQuiz.correctAnswer : ''}"
          ${showAnswer ? 'disabled' : ''}
        >
      </label>
    </div>`;
  }

  _buildMultiInputDescription(rawQuiz, showAnswer) {
    if (!rawQuiz.description) {
      throw new Error('Empty description in the multi-input quiz type.');
    }

    const onInput = () => {
      if (this.value === ' ') {
          // This prevents from autocompletion whitespaces
          this.value = '';
      }
      this.parentNode.dataset.value = this.value;

      if (this.value.length === +this.attributes.maxlength.value) {
        let inputs = Array.from(this.parentNode.parentNode.querySelectorAll('input'));
        let index = inputs.indexOf(this);
        if (index === inputs.length - 1) {
          this.blur();
        } else {
          inputs[index + 1].focus();
        }
      }
    };

    let splittedDescription = rawQuiz.description.split('<in>');

    function *initInputGenerator() {
      for (let answer of rawQuiz.correctAnswer) {
        yield `<label class="input-sizer input-sizer--inline"
          ${showAnswer ? `data-value="${answer}"` : ''}>
          <input type="text"
            onInput="(${onInput})()"
            size="2"
            value="${showAnswer ? answer : ''}"
            maxlength="${answer.length}"
            ${showAnswer ? 'disabled' : ''}
          >
        </label>`;
      }
    }

    let inputGenerator = initInputGenerator();

    return `<div class="description">${splittedDescription.map((d) => 
      this._htmlEntities(d)).map((d) => {
        let {value, done} = inputGenerator.next();
        return d + (done ? '' : value);
      }).join('')
    }</div>`;
  }

  shuffleChoices(choices) {
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = choices[i];
      choices[i] = choices[j];
      choices[j] = temp;
    }
  }

  buildCorrectQuizCard(quiz, quizIndex, quizzes) {
    return `<div class="swiper-slide">
              <div class="card">
                ${this.buildQuiz(quiz, quizIndex, quizzes, true)}
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
        bulletClass: 'indicator'
      }
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
  let quizCategories = QUIZ_CATEGORIES.map((data) => {
    return `<a href="#" class="quiz-category" data-quiz-category="${data.category}" data-quiz-title="${data.title}">${data.title}</a>`;
  });

  document.getElementById('quiz-categories').innerHTML = quizCategories.join('');

  const ui = new UI;
  const game = new Game;
  const quizService = new QuizService();
  const controller = new Controller(ui, game, quizService);

  ui.startButton.onclick = () => controller.start();
  ui.quiz.onsubmit = (e) => {e.preventDefault(); controller.submitAnswer(true)};
  ui.menuButton.addEventListener('click', () => controller.toggleMenu());
  ui.closeMenuButton.onclick = () => controller.toggleMenu();
  ui.viewAnswersButton.onclick = () => controller.viewAnswers();
  document.body.onkeyup = (e) => e.key === "Escape" ? controller.toggleMenu() : null;
  document.addEventListener('timeout', () => controller.submitAnswer(false));

  ui.quizCategories.forEach((value) => {
    value.onclick = controller.loadQuizzesByType.bind(
      controller,
      value.getAttribute('data-quiz-category'),
      value.getAttribute('data-quiz-title')
    );
  });

  ui.menuLinks.forEach((value) => {
    value.onclick = () => ui.openLink(value.dataset.menu);
  });

  ui.restartButtons.forEach((value) => {
    value.onclick = () => controller.restart();
  });

  controller.loadQuizzesByType(
    QUIZ_CATEGORIES[0].category,
    QUIZ_CATEGORIES[0].title
  );
}

document.addEventListener('DOMContentLoaded', eventListeners);