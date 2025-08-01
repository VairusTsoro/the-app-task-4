document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch("http://localhost:4000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            let data;
            try {
                data = await res.json();
            } catch (err) {
                console.error("Failed to parse JSON response:", err);
            }

            if (res.ok) {
                window.location.href = "./frontend/login.html";
            } else {
                document.getElementById("register-error").innerText = data?.message || "Registration failed.";
            }
        } catch (err) {
            console.error("Registration error:", err);
            document.getElementById("register-error").innerText = "Something went wrong.";
        }
    });
}); 