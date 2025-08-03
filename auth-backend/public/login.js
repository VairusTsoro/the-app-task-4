import { API_URL } from "./index.js";
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "./dashboard.html";
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Something went wrong.");
    }
  });
});

if (localStorage.getItem("token")) {
  window.location.href = "./dashboard.html";
}