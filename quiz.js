(function(){
	const yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	const params = new URLSearchParams(window.location.search);
	const difficultyParam = (params.get("difficulty") || "any").toLowerCase();
	const valid = ["any","easy","medium","hard"]; 
	const difficulty = valid.includes(difficultyParam) ? difficultyParam : "any";

	const apis = (window.TechQuizzerConfig && window.TechQuizzerConfig.APIS) || {};
	const apiUrl = apis[difficulty] || apis.any;

	const difficultyPill = document.getElementById("difficulty-pill");
	if (difficultyPill) difficultyPill.textContent = capitalize(difficulty);

	const questionEl = document.getElementById("question");
	const answersEl = document.getElementById("answers");
	const progressEl = document.getElementById("progress");
	const nextBtn = document.getElementById("next");
	const quizCard = document.getElementById("quiz-card");
	const resultCard = document.getElementById("result-card");
	const scoreEl = document.getElementById("score");
	const retryBtn = document.getElementById("retry");

	let questions = [];
	let currentIndex = 0;
	let score = 0;
	let selectedIndex = null;
	let revealed = false;

	init();

	function init(){
		fetchQuestions()
			.then(qs => {
				questions = qs;
				currentIndex = 0;
				score = 0;
				showQuestion();
			})
			.catch(() => {
				if (questionEl) questionEl.textContent = "Failed to load questions. Please try again.";
			});

		nextBtn.addEventListener("click", handleNext);
		retryBtn.addEventListener("click", () => {
			window.location.reload();
		});
	}

	async function fetchQuestions(){
		const url = apiUrl;
		const res = await fetch(url);
		const data = await res.json();
		
		return (data.results || []).map(normalizeQuestion);
	}

	function normalizeQuestion(raw){
		const decodedQuestion = htmlDecode(raw.question);
		const correct = htmlDecode(raw.correct_answer);
		const incorrect = (raw.incorrect_answers || []).map(htmlDecode);
		const allAnswers = shuffle([correct, ...incorrect]);
		const correctIdx = allAnswers.indexOf(correct);
		return {
			question: decodedQuestion,
			answers: allAnswers,
			correctIndex: correctIdx
		};
	}

	function showQuestion(){
		selectedIndex = null;
		revealed = false;
		nextBtn.disabled = true;
		nextBtn.textContent = "Next";
		const q = questions[currentIndex];
		if (!q) return;
		if (questionEl) questionEl.textContent = q.question;
		if (progressEl) progressEl.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
		renderAnswers(q);
	}

	function renderAnswers(q){
		answersEl.innerHTML = "";
		q.answers.forEach((text, idx) => {
			const li = document.createElement("li");
			li.className = "answer";
			li.textContent = text;
			li.tabIndex = 0;
			li.addEventListener("click", () => selectAnswer(idx));
			li.addEventListener("keypress", (e) => {
				if (e.key === "Enter" || e.key === " ") selectAnswer(idx);
			});
			answersEl.appendChild(li);
		});
	}

	function selectAnswer(idx){
		if (selectedIndex !== null) return;
		selectedIndex = idx;
		const q = questions[currentIndex];

		if (selectedIndex === q.correctIndex) {
			score++;
		}
		Array.from(answersEl.children).forEach((li, i) => {
			li.classList.remove("selected","correct","incorrect");
			if (i === q.correctIndex) li.classList.add("correct");
			else if (i === selectedIndex) li.classList.add("incorrect");
		});

		revealed = true;
		nextBtn.disabled = false;
		nextBtn.textContent = "Next question";
	}

	function handleNext(){
		if (!revealed) return;

		currentIndex++;
		if (currentIndex >= questions.length) {
			showResult();
		} else {
			showQuestion();
		}
	}

	function showResult(){
		quizCard.classList.add("hidden");
		resultCard.classList.remove("hidden");
		if (scoreEl) scoreEl.textContent = `You scored ${score} out of ${questions.length}.`;
	}

	function htmlDecode(input){
		const txt = document.createElement("textarea");
		txt.innerHTML = input;
		return txt.value;
	}

	function shuffle(arr){
		const a = arr.slice();
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function capitalize(s){
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
})();


