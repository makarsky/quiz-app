var randomQuizzes = [];

function showTab(n) {
  // This function will display the specified tab of the form...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  //... and fix the Previous/Next buttons:
//   if (n == 0) {
//     document.getElementById("prevBtn").style.display = "none";
//   } else {
//     document.getElementById("prevBtn").style.display = "inline";
//   }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Submit";
  }

  fixStepIndicator(n)
}

function nextPrev(n) {
  clearInterval(timer);
  // This function will figure out which tab to display
  var x = document.getElementById("regForm");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
//   x[currentTab].style.display = "none";
    x.classList.add("removed-item");
    x.classList.remove("new-item");
    setTimeout(function() {
  
    x.classList.add("new-item");
    x.classList.remove("removed-item");
    document.body.style.height = "99%";
    document.body.style.width = "99%";
    document.body.style.height = "100%";
    document.body.style.width = "100%";
    document.getElementById("timeBar").style.width ='100%';
    move()
    }, 800);
    
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form...
  if (currentTab >= x.length) {
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (y[i].value === "") {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false
      valid = false;
    }
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
      document.getElementsByClassName("step")[currentTab].className += " correct";
  } else {
      document.getElementsByClassName("step")[currentTab].className += " wrong";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class on the current step:
  x[n].className += " active";
}

function move() {
  var elem = document.getElementById("timeBar");
//   elem.style.width ='100%';
  var width = 100;
  timer = setInterval(frame, 5);
  function frame() {
    if (width <= 0) {
      clearInterval(timer);
    } else {
      width -= 0.0125; 
      elem.style.width = width + '%'; 
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

function loadQuizzes(quizName) {
  var request =  new XMLHttpRequest();
  request.open('GET', 'https://raw.githubusercontent.com/makarsky/quiz-app/master/quizzes/sql_quiz.json');
  request.onload = () => {
    var loadedQuizzes = JSON.parse(request.responseText);

    for (var i = 0; i < 5; i++) {
      var randomNumber = Math.floor(Math.random() * loadedQuizzes.questions.length);
      
      var randomQuiz = loadedQuizzes.questions[randomNumber];
      randomQuizzes.push(randomQuiz);
      loadedQuizzes.questions.splice(randomNumber, 1);
    }
  };

  request.onerror = () => console.log('Error');
  request.send();
}