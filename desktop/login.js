document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.classList.add("hidden");

  if (!email) {
    errorMsg.textContent = "Please enter your email.";
    errorMsg.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/me?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("User not found");

    const employee = await response.json();

    // ✅ Save the user to local file via IPC
    window.electronAPI.saveUser(employee);

    // ✅ Redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (err) {
    errorMsg.textContent = "Invalid email or user not found.";
    errorMsg.classList.remove("hidden");
  }
});
