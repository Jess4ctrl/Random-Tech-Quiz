(function(){
	const yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	const form = document.getElementById("start-form");
	if (!form) return;

	form.addEventListener("submit", function(e){
		e.preventDefault();
		const select = document.getElementById("difficulty");
		const difficulty = select ? select.value : "any";
		window.location.href = `quiz.html?difficulty=${encodeURIComponent(difficulty)}`;
	});
})();


