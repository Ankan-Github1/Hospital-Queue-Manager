/**************************************
 DIGITAL QUEUE MANAGER - script.js
 Beginner-friendly, hackathon-ready
**************************************/

/* --------------------
   GLOBAL DATA
-------------------- */

// Load queue from localStorage or start empty
let queue = JSON.parse(localStorage.getItem("queue")) || [];

// Current token number
let tokenCounter = Number(localStorage.getItem("tokenCounter")) || 1;

// Current serving index
let currentIndex = Number(localStorage.getItem("currentIndex")) || 0;

// Queue paused or not
let isPaused = JSON.parse(localStorage.getItem("isPaused")) || false;


/* --------------------
   SAVE TO STORAGE
-------------------- */

function saveData() {
    localStorage.setItem("queue", JSON.stringify(queue));
    localStorage.setItem("tokenCounter", tokenCounter);
    localStorage.setItem("currentIndex", currentIndex);
    localStorage.setItem("isPaused", JSON.stringify(isPaused));
}


/* --------------------
   PATIENT PAGE LOGIC
-------------------- */

const patientForm = document.getElementById("patientForm");

if (patientForm) {
    patientForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;

        // Generate token like M-001
        const token = "M-" + String(tokenCounter).padStart(3, "0");

        const patient = {
            token: token,
            name: name,
            notified: false
        };

        queue.push(patient);
        tokenCounter++;

        saveData();

        showPatientToken(token);
        updatePatientView(token);

        patientForm.reset();
    });
}


// Show token section
function showPatientToken(token) {
    document.getElementById("tokenSection").classList.remove("hidden");
    document.getElementById("yourToken").innerText = token;
}


// Update patient live info
function updatePatientView(token) {
    const interval = setInterval(() => {
        queue = JSON.parse(localStorage.getItem("queue")) || [];
        currentIndex = Number(localStorage.getItem("currentIndex")) || 0;

        const patientIndex = queue.findIndex(p => p.token === token);

        if (patientIndex === -1) return;

        const patientsAhead = patientIndex - currentIndex;
        const waitTime = Math.max(patientsAhead * 5, 0);

        document.getElementById("currentToken").innerText =
            queue[currentIndex]?.token || "-";

        document.getElementById("position").innerText =
            patientsAhead >= 0 ? patientsAhead : 0;

        document.getElementById("waitTime").innerText = waitTime;

        const notificationBox = document.getElementById("notificationBox");

        // Near turn alert
        if (patientsAhead === 2 && !queue[patientIndex].notified) {
            notificationBox.innerText =
                "🔔 Your turn is coming soon. Please stay nearby.";
            notificationBox.className = "notification warning";
            queue[patientIndex].notified = true;
            saveData();
        }

        // Turn now
        if (patientsAhead === 0) {
            notificationBox.innerText =
                "✅ It's your turn now. Please go to the doctor.";
            notificationBox.className = "notification success";
            clearInterval(interval);
        }

    }, 2000);
}


/* --------------------
   ADMIN PAGE LOGIC
-------------------- */

const nextBtn = document.getElementById("nextBtn");
const pauseBtn = document.getElementById("pauseBtn");

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (isPaused) return;

        if (currentIndex < queue.length) {
            currentIndex++;
            saveData();
            updateAdminView();
        }
    });
}

if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
        isPaused = !isPaused;
        pauseBtn.innerText = isPaused ? "Resume Queue" : "Pause Queue";
        saveData();
    });
}


// Update admin dashboard
function updateAdminView() {
    queue = JSON.parse(localStorage.getItem("queue")) || [];
    currentIndex = Number(localStorage.getItem("currentIndex")) || 0;

    const currentTokenSpan = document.getElementById("adminCurrentToken");
    const queueLengthSpan = document.getElementById("queueLength");
    const queueList = document.getElementById("queueList");

    if (!currentTokenSpan) return;

    currentTokenSpan.innerText =
        queue[currentIndex]?.token || "None";

    queueLengthSpan.innerText =
        queue.length - currentIndex;

    queueList.innerHTML = "";

    for (let i = currentIndex; i < queue.length; i++) {
        const li = document.createElement("li");
        li.innerText = `${queue[i].token} - ${queue[i].name}`;
        queueList.appendChild(li);
    }
}


// Auto-refresh admin view
if (document.getElementById("queueList")) {
    setInterval(updateAdminView, 2000);
}
