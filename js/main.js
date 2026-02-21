document.addEventListener("DOMContentLoaded", function () {

    const navbar = document.getElementById("navbar");
    const bookBtn = document.querySelector(".book-btn");
    const userArea = document.getElementById("userArea");
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    const toast = document.getElementById("toast");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const username = localStorage.getItem("loggedInUser");

    /* Reveal Animation (Optimized) */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    /* Hamburger */
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }

    /* Toast Function */
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    /* Book Button */
    if (bookBtn) {
        bookBtn.addEventListener("click", function () {
            if (isLoggedIn) {
                window.location.href = "appointment.html";
            } else {
                showToast("Please login first");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            }
        });
    }

    /* Navbar User Display (Safe DOM Rendering) */
    if (userArea) {

        if (isLoggedIn && username) {

            const span = document.createElement("span");
            span.textContent = username;
            span.style.marginRight = "10px";
            span.style.fontWeight = "500";
            span.style.color = "#1565c0";

            const logoutBtn = document.createElement("button");
            logoutBtn.textContent = "Logout";
            logoutBtn.classList.add("btn");

            logoutBtn.addEventListener("click", function () {
                localStorage.clear();
                window.location.href = "index.html";
            });

            userArea.appendChild(span);
            userArea.appendChild(logoutBtn);

        } else {

            const loginBtn = document.createElement("a");
            loginBtn.href = "login.html";
            loginBtn.textContent = "Login";
            loginBtn.classList.add("btn");
            loginBtn.style.marginRight = "8px";

            const registerBtn = document.createElement("a");
            registerBtn.href = "register.html";
            registerBtn.textContent = "Register";
            registerBtn.classList.add("btn");

            userArea.appendChild(loginBtn);
            userArea.appendChild(registerBtn);
        }
    }

});