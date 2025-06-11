let clockedIn = false;
let timerInterval;
let startTime;

const clockBtn = document.getElementById("clock-btn");
const timerDisplay = document.getElementById("timer-display");

let screenshotInterval;
let currentUser;

function disableInputs() {
  document.getElementById("project").disabled = true;
  document.getElementById("task").disabled = true;
}

function enableInputs() {
  document.getElementById("project").disabled = false;
  document.getElementById("task").disabled = false;
}
function startTimer() {
  startTime = Math.floor(Date.now() / 1000);
  timerDisplay.style.display = 'block';

  timerInterval = setInterval(() => {
    const elapsed = Math.floor(Date.now() / 1000) - startTime;
    timerDisplay.innerText = `⏱️ ${formatTime(elapsed)}`;
  }, 1000);
}

window.addEventListener("DOMContentLoaded", async () => {
  console.log("🌐 Dashboard loaded");
  const savedTaskId = localStorage.getItem("taskId");
  const savedProjectId = localStorage.getItem("projectId");

  // ✅ Load user from preload
  currentUser = await window.electronAPI.getUser();

  if (!currentUser || !currentUser.email) {
    alert("No user found. Please log in again.");
    throw new Error("❌ Missing user info");
  }

  console.log("✅ Logged in as:", currentUser.email);


  const wasClockedIn = localStorage.getItem("clockedIn") === "true";
  const storedStart = localStorage.getItem("clockInStart");

  if (wasClockedIn && storedStart) {
    clockedIn = true;
    startTime = Math.floor(parseInt(storedStart, 10) / 1000);
    clockBtn.innerText = "Clock Out";
    clockBtn.classList.replace("bg-green-500", "bg-red-500");
    document.getElementById("project").value = savedProjectId;
    document.getElementById("task").value = savedTaskId;
    disableInputs();
    startTimer();

    // 🔁 Resume screenshot loop
    screenshotInterval = setInterval(() => {
      window.electronAPI.sendScreenshot({
        email: currentUser.email,
        has_permission: true
      });
    }, 10 * 1000);}

  try {
    const resProjects = await fetch(`http://localhost:8000/projects?email=${currentUser.email}`);
    const resTasks = await fetch(`http://localhost:8000/tasks?email=${currentUser.email}`);

    const projects = await resProjects.json();
    const tasks = await resTasks.json();

    const projectSelect = document.getElementById("project");
    const taskSelect = document.getElementById("task");

    projectSelect.innerHTML = projects.map(p =>
      `<option value="${p.id}">${p.name}</option>`
    ).join("");

    taskSelect.innerHTML = tasks.map(t =>
      `<option value="${t.id}">${t.name}</option>`
    ).join("");

  } catch (err) {
    console.error("❌ Failed to load projects/tasks:", err);
    alert("Could not load projects or tasks.");
  }

});

function formatTime(duration) {
  const hrs = String(Math.floor(duration / 3600)).padStart(2, '0');
  const mins = String(Math.floor((duration % 3600) / 60)).padStart(2, '0');
  const secs = String(duration % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerDisplay.style.display = 'none';
}

clockBtn.addEventListener("click", async () => {
  const projectId = document.getElementById("project").value;
  const taskId = document.getElementById("task").value;

  if (!projectId || !taskId) {
    alert("Select both project and task first.");
    return;
  }

  clockedIn = !clockedIn;

  if (clockedIn) {
    disableInputs();
    localStorage.setItem("clockedIn", "true");
    localStorage.setItem("clockInStart", Date.now().toString());
    localStorage.setItem("taskId", taskId);
    localStorage.setItem("projectId", projectId);

    clockBtn.innerText = "Clock Out";
    clockBtn.classList.replace("bg-green-500", "bg-red-500");

    try {
      await fetch("http://localhost:8000/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_email: currentUser.email,
          project_id: projectId,
          task_id: taskId
        })
      });

      console.log("✅ Clock-in successful");
    } catch (err) {
      console.error("❌ Clock-in error:", err);
      alert("Failed to clock in.");
      return;
    }

    startTimer();

    screenshotInterval = setInterval(() => {
      window.electronAPI.sendScreenshot({
        email: currentUser.email,
        has_permission: true // Real permission check can be wired in future
      });
    }, 10 * 1000);

    console.log("📸 Screenshot capture started");
  } else {
    enableInputs();
    clockBtn.innerText = "Clock In";
    clockBtn.classList.replace("bg-red-500", "bg-green-500");

    try {
      await fetch("http://localhost:8000/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_email: currentUser.email,
          project_id: localStorage.getItem("projectId"),
          task_id: localStorage.getItem("taskId")
        })
      });

      console.log("✅ Clock-out successful");
      localStorage.removeItem("clockedIn");
      localStorage.removeItem("clockInStart");
      localStorage.removeItem("taskId");
      localStorage.removeItem("projectId");
    } catch (err) {
      console.error("❌ Clock-out error:", err);
      alert("Failed to clock out.");
    }

    clearInterval(screenshotInterval);
    stopTimer();

    console.log("🛑 Screenshot capture stopped");
  }
});
