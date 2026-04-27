const questions = [
    {
        q: "What is the primary benefit of avoiding distractions?",
        options: ["Deep Work & Focus", "More screen time", "Random dopamine hits", "Feeling busy"],
        correct: 0
    },
    {
        q: "How long does it take to refocus after an interruption?",
        options: ["1 minute", "23 minutes", "5 seconds", "10 minutes"],
        correct: 1
    },
    {
        q: "Which technique involves 25 mins work and 5 mins break?",
        options: ["The Matrix Method", "Pomodoro Technique", "Hyperfocus", "Timeboxing"],
        correct: 1
    },
    {
        q: "What does 'deep work' mean?",
        options: ["Working underwater", "Distraction-free focused work", "Multitasking efficiently", "Working long hours"],
        correct: 1
    },
    {
        q: "Which is the best way to start a productive day?",
        options: ["Check social media first", "Plan your top 3 tasks", "Reply to all emails", "Watch motivational videos"],
        correct: 1
    },
    {
        q: "What is 'time blocking'?",
        options: ["Blocking websites", "Scheduling specific tasks in time slots", "Taking frequent breaks", "Avoiding meetings"],
        correct: 1
    }
];

const SHOWN_KEY = "mg_quiz_shown";

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('url');

    let shownIndexes = JSON.parse(sessionStorage.getItem(SHOWN_KEY) || "[]");

    if (shownIndexes.length >= questions.length) {
        shownIndexes = [];
    }

    const available = questions
        .map((_, i) => i)
        .filter(i => !shownIndexes.includes(i));

    const qIndex = available[Math.floor(Math.random() * available.length)];
    shownIndexes.push(qIndex);
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify(shownIndexes));

    const data = questions[qIndex];

    document.getElementById('question').innerText = data.q;

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = "";

    data.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(idx, data.correct, targetUrl);
        optionsDiv.appendChild(btn);
    });
});

function handleAnswer(selected, correct, url) {
    const feedback = document.getElementById('feedback');

    document.querySelectorAll('.btn').forEach(b => b.disabled = true);

    if (selected === correct) {
        feedback.style.color = "#4ade80";
        feedback.innerText = "✅ Correct! Redirecting...";

        // 🔥 FIX: save unlock globally
        chrome.storage.local.set({ ytUnlocked: true }, () => {
            setTimeout(() => {
                window.location.href = url;
            }, 1000);
        });

    } else {
        feedback.style.color = "#f87171";
        feedback.innerText = "❌ Wrong answer! Try again.";

        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}