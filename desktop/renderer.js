let clockedIn = false;
let timerInterval = null;
let seconds = 0;

document.getElementById("toggleBtn").addEventListener("click", () => {
  clockedIn = !clockedIn;

  const status = document.getElementById("status");
  const timer = document.getElementById("timer");
  const btn = document.getElementById("toggleBtn");

  if (clockedIn) {
    btn.textContent = "Clock Out";
    status.classList.remove("hidden");
    seconds = 0;
    timer.textContent = "00:00";
    timerInterval = setInterval(() => {
      seconds++;
      const min = String(Math.floor(seconds / 60)).padStart(2, "0");
      const sec = String(seconds % 60).padStart(2, "0");
      timer.textContent = `${min}:${sec}`;
    }, 1000);
  } else {
    btn.textContent = "Clock In";
    status.classList.add("hidden");
    clearInterval(timerInterval);
  }
});