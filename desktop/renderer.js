let clockedIn = false;
let timerInterval;
let startTime;

const clockBtn = document.getElementById("clock-btn");
const timerDisplay = document.getElementById("timer-display");
const projectSelect = document.getElementById("project");
const taskSelect = document.getElementById("task");
const projectLoading = document.getElementById("project-loading");
const taskLoading = document.getElementById("task-loading");
const logoutBtn = document.getElementById("logout-btn");

let screenshotInterval;
let currentUser;

function disableInputs() {
  projectSelect.disabled = true;
  taskSelect.disabled = true;
}

function enableInputs() {
  projectSelect.disabled = false;
  taskSelect.disabled = !projectSelect.value; // Only enable task if project is selected
}

function startTimer() {
  startTime = Math.floor(Date.now() / 1000);
  timerDisplay.style.display = 'block';

  timerInterval = setInterval(() => {
    const elapsed = Math.floor(Date.now() / 1000) - startTime;
    timerDisplay.innerText = `⏱️ ${formatTime(elapsed)}`;
  }, 1000);
}

async function loadProjects() {
  try {
    projectLoading.style.display = 'block';
    const response = await fetch(`http://localhost:8000/projects/employee/${currentUser.email}`);
    const projects = await response.json();
    
    projectSelect.innerHTML = '<option value="">Select a project...</option>' + 
      projects.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
    
    projectLoading.style.display = 'none';
  } catch (err) {
    console.error("❌ Failed to load projects:", err);
    alert("Could not load projects.");
    projectLoading.style.display = 'none';
  }
}

async function loadTasks(projectId) {
  try {
    taskLoading.style.display = 'block';
    taskSelect.disabled = true;
    taskSelect.innerHTML = '<option value="">Loading tasks...</option>';
    
    const response = await fetch(`http://localhost:8000/tasks/employee/${currentUser.email}/project/${projectId}`);
    const tasks = await response.json();
    
    taskSelect.innerHTML = '<option value="">Select a task...</option>' + 
      tasks.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    
    taskSelect.disabled = false;
    taskLoading.style.display = 'none';
  } catch (err) {
    console.error("❌ Failed to load tasks:", err);
    alert("Could not load tasks.");
    taskLoading.style.display = 'none';
    taskSelect.innerHTML = '<option value="">Error loading tasks</option>';
  }
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

  // Load initial projects
  await loadProjects();

  const wasClockedIn = localStorage.getItem("clockedIn") === "true";
  const storedStart = localStorage.getItem("clockInStart");

  if (wasClockedIn && storedStart) {
    clockedIn = true;
    startTime = Math.floor(parseInt(storedStart, 10) / 1000);
    clockBtn.innerText = "Clock Out";
    clockBtn.classList.replace("bg-green-500", "bg-red-500");
    
    // Restore saved project and task
    if (savedProjectId) {
      projectSelect.value = savedProjectId;
      await loadTasks(savedProjectId);
      if (savedTaskId) {
        taskSelect.value = savedTaskId;
      }
    }
    
    disableInputs();
    startTimer();

    // 🔁 Resume screenshot loop
    screenshotInterval = setInterval(() => {
      window.electronAPI.sendScreenshot({
        email: currentUser.email,
        has_permission: true
      });
    }, 10 * 1000);
  }
});

// Add event listener for project selection
projectSelect.addEventListener("change", async (e) => {
  const projectId = e.target.value;
  if (projectId) {
    await loadTasks(projectId);
  } else {
    taskSelect.innerHTML = '<option value="">Select a project first...</option>';
    taskSelect.disabled = true;
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
  const projectId = projectSelect.value;
  const taskId = taskSelect.value;

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
        has_permission: true
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

logoutBtn.addEventListener("click", () => {
    if (clockedIn) {
        alert("Please clock out before logging out");
        return;
    }
    
    // Clear all stored data
    localStorage.clear();
    
    // Delete user.json
    window.electronAPI.deleteUser();
    
    // Redirect to login
    window.location.href = "login.html";
});
