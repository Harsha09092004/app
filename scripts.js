document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('studentRegistrationForm');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPortal = document.getElementById('admin-portal');
    const studentList = document.getElementById('studentList');
    const questionList = document.getElementById('questionList');
    const notifyInterviewsButton = document.getElementById('notifyInterviews');
    const generateQuestionsButton = document.getElementById('generateQuestions');
    const filterStudentsButton = document.getElementById('filterStudents');
    const popupModal = document.getElementById('popupModal');
    const popupMessage = document.getElementById('popupMessage');
    const closeModal = document.querySelector('.close');

    const addStudentForm = document.getElementById('addStudentForm');
    const adminStudentList = document.getElementById('admin-student-list');
    const studentQuestionSection = document.getElementById('student-question-section');
    const studentAnswerForm = document.getElementById('studentAnswerForm');
    const resultsSection = document.getElementById('resultsSection');
    const resultsList = document.getElementById('resultsList');
    const timerDisplay = document.getElementById('timer');
    
    let students = [];
    let studentAnswers = {};
    let adminCredentials = { username: "admin", password: "admin123" };
    let currentStudent = null;
    let timer;
    let timerDuration = 10 * 60 * 1000; // 10 minutes

    // Sample list of questions (problem-solving & coding)
    let questionBank = [
        { question: "What is a binary search?", type: "problem-solving", answer: "A search algorithm that finds the position of a target value" },
        { question: "Explain the quicksort algorithm.", type: "problem-solving", answer: "A divide-and-conquer algorithm that sorts by partitioning" },
        { question: "Write a function to reverse a string.", type: "coding", answer: "function reverseString(s) { return s.split('').reverse().join(''); }" },
        { question: "Find the factorial of a number using recursion.", type: "coding", answer: "function factorial(n) { return n === 0 ? 1 : n * factorial(n - 1); }" },
        { question: "What is a linked list?", type: "problem-solving", answer: "A data structure where each element points to the next" },
        { question: "Write a function to find the largest number in an array.", type: "coding", answer: "function findLargest(arr) { return Math.max(...arr); }" },
        { question: "Explain the difference between stack and queue.", type: "problem-solving", answer: "Stack is LIFO; Queue is FIFO" },
        { question: "Implement a stack using arrays in JavaScript.", type: "coding", answer: "class Stack { constructor() { this.items = []; } push(item) { this.items.push(item); } pop() { return this.items.pop(); } }" },
        { question: "What is Big-O notation?", type: "problem-solving", answer: "A notation to describe the complexity of an algorithm" },
        { question: "Write a function to merge two sorted arrays.", type: "coding", answer: "function mergeArrays(a, b) { let merged = []; let i = 0, j = 0; while (i < a.length && j < b.length) { if (a[i] < b[j]) merged.push(a[i++]); else merged.push(b[j++]); } return merged.concat(a.slice(i)).concat(b.slice(j)); }" },
        { question: "Explain depth-first search.", type: "problem-solving", answer: "A graph traversal method that explores as far as possible along each branch before backtracking" },
        { question: "Write a function to check if a number is prime.", type: "coding", answer: "function isPrime(n) { if (n <= 1) return false; for (let i = 2; i <= Math.sqrt(n); i++) { if (n % i === 0) return false; } return true; }" },
        { question: "What is dynamic programming?", type: "problem-solving", answer: "A method for solving complex problems by breaking them into simpler subproblems" },
        { question: "Write a function to find the Fibonacci sequence.", type: "coding", answer: "function fibonacci(n) { let a = 0, b = 1, temp; while (n-- > 0) { temp = a; a = a + b; b = temp; } return temp; }" },
        { question: "What is a hash table?", type: "problem-solving", answer: "A data structure that maps keys to values using hash functions" }
    ];

    // Add Student to the list
    addStudentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('add-student-name').value;
        const regno = document.getElementById('add-student-regno').value;
        const password = document.getElementById('add-student-password').value;
        const gpa = document.getElementById('add-student-gpa').value;

        const newStudent = { name, regno, password, gpa };
        students.push(newStudent);
        updateStudentListAdmin();
        addStudentForm.reset();
    });

    // Update Student List for Admin View
    function updateStudentListAdmin() {
        adminStudentList.innerHTML = '';
        students.forEach((student, index) => {
            const studentDiv = document.createElement('div');
            studentDiv.innerHTML = `<strong>${index + 1}. ${student.name}</strong> (Reg. No: ${student.regno}) - GPA: ${student.gpa}`;
            adminStudentList.appendChild(studentDiv);
        });
    }

    // Admin Login
    adminLoginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('admin-id').value;
        const password = document.getElementById('admin-password').value;

        if (username === adminCredentials.username && password === adminCredentials.password) {
            showAdminPortal();
        } else {
            showPopup('Invalid Admin Credentials');
        }
    });

    // Show Admin Portal on successful login
    function showAdminPortal() {
        adminLoginForm.classList.add('hidden');
        adminPortal.classList.remove('hidden');
    }

    // Generate Questions on button click
    generateQuestionsButton.addEventListener('click', () => {
        generateQuestions();
    });

    // Function to generate and display 15 random questions
    function generateQuestions() {
        studentQuestionSection.innerHTML = ''; // Clear the section
        studentAnswerForm.innerHTML = ''; // Clear answers
        questionList.innerHTML = ''; // Clear the list

        // Shuffle and select 15 random questions
        let shuffledQuestions = questionBank.sort(() => 0.5 - Math.random()).slice(0, 15);

        // Store questions for later validation
        studentAnswers = {};
        
        shuffledQuestions.forEach((q, index) => {
            const questionItem = document.createElement('li');
            questionItem.innerHTML = `
                ${index + 1}. ${q.question} (${q.type})
                <input type="text" id="answer-${index}" placeholder="Your answer">
            `;
            questionList.appendChild(questionItem);

            // Add to student answers storage
            studentAnswers[`answer-${index}`] = q.answer;
        });

        // Add submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit All Answers';
        submitButton.addEventListener('click', submitAllAnswers);
        studentAnswerForm.appendChild(submitButton);

        // Start timer
        startTimer();

        showPopup("15 Questions have been generated!");
    }

    // Timer Function
    function startTimer() {
        let timeRemaining = timerDuration;

        function updateTimer() {
            if (timeRemaining <= 0) {
                clearInterval(timer);
                showPopup('Time is up! Submitting your answers.');
                submitAllAnswers();
                return;
            }

            let minutes = Math.floor(timeRemaining / 60000);
            let seconds = ((timeRemaining % 60000) / 1000).toFixed(0);
            timerDisplay.textContent = `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
            timeRemaining -= 1000;
        }

        updateTimer();
        timer = setInterval(updateTimer, 1000);
    }

    // Submit All Answers
    function submitAllAnswers() {
        if (currentStudent) {
            let correctCount = 0;

            for (let [key, correctAnswer] of Object.entries(studentAnswers)) {
                const answer = document.getElementById(key).value;
                if (answer === correctAnswer) correctCount++;
            }

            // Store results
            const result = { regno:
