// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value.trim();
        const message = document.getElementById("registerMessage");

        if (!name || !email || !password) {
            return;
        }

        // Get existing users or empty array
        let users = JSON.parse(localStorage.getItem("medicareUsers")) || [];

        // Check if email already exists (case-insensitive)
        const emailExists = users.some(user =>
            user.email.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
            if (message) {
                message.textContent = "Email is already registered!";
                message.style.display = "block";
            }
            return;
        }

        // Create new user
        const newUser = {
            name: name,
            email: email,
            password: password
        };

        // Add to users array
        users.push(newUser);

        // Save back to localStorage
        localStorage.setItem("medicareUsers", JSON.stringify(users));

        alert("Registration successful! Please login.");
        window.location.href = "login.html";
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const message = document.getElementById("loginMessage");

    // Hide error while typing
    document.getElementById("loginEmail").addEventListener("input", () => {
        message.style.display = "none";
    });

    document.getElementById("loginPassword").addEventListener("input", () => {
        message.style.display = "none";
    });

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        let users = JSON.parse(localStorage.getItem("medicareUsers")) || [];

        // Find matching user
        const validUser = users.find(user =>
            user.email.toLowerCase() === email.toLowerCase() &&
            user.password === password
        );

        if (!validUser) {
            showError("Invalid email or password");
            return;
        }

        // Login success
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedInUser", validUser.name);

        message.style.display = "none";
        window.location.href = "dashboard.html";
    });

    function showError(text) {
        message.textContent = text;
        message.style.display = "block";
    }
}

// PROTECT DASHBOARD
if (window.location.pathname.includes("dashboard.html")) {

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
        window.location.href = "login.html";
    }
}


// LOGOUT FUNCTION
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}