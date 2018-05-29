let randomQuizzes = [];
const quizTime = 40; // Quiz time in seconds
let currentTab = 0; // Current card
let timer = null;
let quizName = 'js'; // default quiz
const QUIZ_NAMES = {
  'js': 'JavaScript',
  'java': 'Java',
  'sql': 'SQL',
};

function showTab(n) {
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";

  fixStepIndicator(n)
}

function nextPrev(n) {
  clearInterval(timer);
  
  var x = document.getElementById("regForm");
  var tabs = document.getElementsByClassName("tab");
  
  checkAnswer();

  x.classList.add("removed-item");
  x.classList.remove("new-item");

  setTimeout(function() {
    // Hide the current tab:
    tabs[currentTab].style.display = "none";

    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;

    // if you have reached the end of the form...
    if (currentTab >= tabs.length) {
      return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);

    x.classList.add("new-item");
    x.classList.remove("removed-item");
    document.body.style.height = "99%";
    document.body.style.width = "99%";
    document.body.style.height = "100%";
    document.body.style.width = "100%";
    move();
  }, 2000);
}

function checkAnswer() {
  var x, answer, valid = false;
  x = document.getElementsByClassName("tab");
  
  switch (randomQuizzes[currentTab].type) {
    case 'radio':
      answer = x[currentTab].querySelector('input[name=answer]:checked');
      answer ? answer.value === randomQuizzes[currentTab].correctAnswer ? valid = true : null : null;
      break;
    case 'input':
      answer = x[currentTab].querySelector('input');
      answer.value === randomQuizzes[currentTab].correctAnswer ? valid = true : null;
      break;
    case 'select':
      answers = x[currentTab].querySelectorAll('input[name=answer]:checked');
      answers = [].map.call(answers, (e) => e.value);
      arraysEqual(answers, randomQuizzes[currentTab].correctAnswer) ? valid = true : null;
      break;
    case 'multi-input':
      answers = x[currentTab].querySelectorAll('input');
      answers = [].map.call(answers, (e) => e.value);
      // todo: implement multi-input quizzes
  }

  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].classList.add("correct");
  } else {
    document.getElementsByClassName("step")[currentTab].classList.add("wrong");
  }

  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  let x = document.getElementsByClassName("step");

  for (let i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }

  //... and adds the "active" class on the current step:
  x[n].classList.add("active");
}

function move() {
  var timeBar = document.getElementById("timeBar");
  timeBar.style.width = '100%';
  var quizTimeCopy = quizTime;

  timer = setInterval(frame, 5);
  
  function frame() {
    if (quizTimeCopy <= 0) {
      clearInterval(timer);
      nextPrev(1);
    } else {
      quizTimeCopy -= 0.005
      
      width = quizTimeCopy / quizTime * 100;
      timeBar.style.width = width + '%'; 
    }
  }
}

function toggleMenu(element) {
    // element.classList.toggle("change");
    openLink('menu')
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
    openLink('menu')
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

function loadQuizzes() {
  var request =  new XMLHttpRequest();
  request.open('GET', `https://raw.githubusercontent.com/makarsky/quiz-app/master/quizzes/${quizName}_quiz.json`);
  request.onload = () => {
    var loadedQuizzes = JSON.parse(request.responseText);

    for (var i = 0; i < 5; i++) {
      var randomNumber = Math.floor(Math.random() * loadedQuizzes.questions.length);
      
      var randomQuiz = loadedQuizzes.questions[randomNumber];
      randomQuizzes.push(randomQuiz);
      loadedQuizzes.questions.splice(randomNumber, 1);
    }

    addQuizzes(); // Add quizzes to the template
    showTab(currentTab); // Show the current card
  };

  request.onerror = () => console.log('Error');
  request.send();
}

function addQuizzes() {
  var card = document.getElementById("regForm");

  card.innerHTML = randomQuizzes.map(buildQuiz).join('');
}

function buildQuiz(rawQuiz) {
  var template;

  switch (rawQuiz.type) {
    case 'select':
    case 'radio':
      template = 
      `<div class="tab">
        <h4>${rawQuiz.question ? rawQuiz.question : ''}</h4>
        <div>${rawQuiz.description ? rawQuiz.description : ''}</div>
        <br>
        ${choiceBuilder(rawQuiz.type, rawQuiz.choices)}
      </div>`;
      break;
    case 'input':
      template = 
      `<div class="tab">
        <h4>${rawQuiz.question ? rawQuiz.question : ''}</h4>
        <div>${rawQuiz.description ? rawQuiz.description : ''}</div>
        <br>
        <div class="input-container"><input class="input" maxlength="${rawQuiz.correctAnswer.length}"></div>
      </div>`;
      break;
  }

  return template;
}

function choiceBuilder(type, choices) {
  switch (type) {
    case 'select':
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

function countdown() {
  var counter = 3;
  var element = document.getElementById("countdown");

  var countInterval = setInterval(() => {
    element.innerHTML = counter--;
    if (counter === -1) {
      clearInterval(countInterval);
      element.innerHTML = "";
      
      loadQuizzes();
      document.querySelector("#quiz").classList.toggle('not-displayed');
      move();
    };
  }, 700)
}

function start() {
  let element = document.querySelector("#description");
  let button = element.querySelector('button').classList.toggle('not-displayed');
  element.classList.toggle('removed-description');
  countdown();
}

function selectChallenge(name) {
  quizName = name;

  document.querySelector("#quiz-name").innerHTML = QUIZ_NAMES[name];
  closeNav()
}