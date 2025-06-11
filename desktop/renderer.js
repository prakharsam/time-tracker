let clockedIn = false;
let timerInterval;
let startTime;

const clockBtn = document.getElementById("clock-btn");
const timerDisplay = document.getElementById("timer-display");

let screenshotInterval;
let currentUser;

window.addEventListener("DOMContentLoaded", async () => {
  console.log("🌐 Dashboard loaded");

  // ✅ Wait for user to load
  currentUser = await window.electronAPI.getUser();

  if (!currentUser || !currentUser.email) {
    alert("No user found. Please log in again.");
    throw new Error("❌ Missing user info");
  }

  console.log("✅ Logged in as:", currentUser.email);

  try {
    const resProjects = await fetch("http://localhost:8000/projects");
    const resTasks = await fetch("http://localhost:8000/tasks");

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
  }
});

function formatTime(duration) {
  const hrs = String(Math.floor(duration / 3600)).padStart(2, '0');
  const mins = String(Math.floor((duration % 3600) / 60)).padStart(2, '0');
  const secs = String(duration % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function startTimer() {
  startTime = Math.floor(Date.now() / 1000);
  timerDisplay.style.display = 'block';

  timerInterval = setInterval(() => {
    const elapsed = Math.floor(Date.now() / 1000) - startTime;
    timerDisplay.innerText = `⏱️ ${formatTime(elapsed)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerDisplay.style.display = 'none';
}

// Clock-in/out button handler
clockBtn.addEventListener("click", async () => {
  const projectId = document.getElementById("project").value;
  const taskId = document.getElementById("task").value;

  if (!projectId || !taskId) {
    alert("Select a project and task first.");
    return;
  }

  clockedIn = !clockedIn;

  if (clockedIn) {
    clockBtn.innerText = "Clock Out";
    clockBtn.classList.replace("bg-green-500", "bg-red-500");

    // ✅ Call backend clock-in API
    console.log(JSON.stringify({
      employee_id: currentUser.email, // TODO: replace with actual user from preload or memory
      project_id: projectId,
      task_id: taskId
    }))
    await fetch("http://localhost:8000/clock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: currentUser.email, // TODO: replace with actual user from preload or memory
        project_id: projectId,
        task_id: taskId
      })
    });

    startTimer();

    // Placeholder for screenshot + metadata loop
    screenshotInterval = setInterval(() => {
      window.electronAPI.sendScreenshot({
        email: currentUser.email,
        has_permission: true
      });
    }, 10 * 1000); // every 30s
    
    console.log("🟡 Starting screenshot & metadata capture loop...");
  } else {
    clockBtn.innerText = "Clock In";
    clockBtn.classList.replace("bg-red-500", "bg-green-500");

    // ✅ Call backend clock-out API
    await fetch("http://localhost:8000/clock-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: currentUser.email // TODO: replace with actual user
      })
    });

    clearInterval(screenshotInterval);

    stopTimer();

    // 🧠 Stop screenshot & metadata loop
    console.log("🛑 Stopping screenshot & metadata capture...");
  }
});
