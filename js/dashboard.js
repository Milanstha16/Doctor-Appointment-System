document.addEventListener("DOMContentLoaded", function () {
// ROUTE PROTECTION
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const username = localStorage.getItem("loggedInUser");

    if (!isLoggedIn || !username) {
        window.location.replace("login.html");
        return;
    }

    // DISPLAY USERNAME
    const usernameDisplay = document.getElementById("usernameDisplay");
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }

    // LOGOUT BUTTON
    const userArea = document.getElementById("userArea");
    if (userArea) {
        userArea.innerHTML = `<button class="btn" id="logoutBtn">Logout</button>`;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            window.location.replace("index.html");
        });
    }

    // LOAD APPOINTMENTS
    function getAllAppointments() {
        return JSON.parse(localStorage.getItem("appointments")) || [];
    }

    function saveAppointments(data) {
        localStorage.setItem("appointments", JSON.stringify(data));
    }

    let allAppointments = getAllAppointments();

    // AUTO UPDATE STATUS (GLOBAL FIXED)
    function autoUpdateStatuses() {
        const now = Date.now();
        let updated = false;

        allAppointments.forEach(app => {
            if (app.status === "upcoming") {
                const appointmentTime = new Date(`${app.date}T${app.time}`).getTime();
                if (appointmentTime < now) {
                    app.status = "completed";
                    updated = true;
                }
            }
        });

        if (updated) saveAppointments(allAppointments);
    }

    autoUpdateStatuses();

    // DOM ELEMENTS
    const totalAppointments = document.getElementById("totalAppointments");
    const upcomingAppointments = document.getElementById("upcomingAppointments");
    const completedAppointments = document.getElementById("completedAppointments");
    const appointmentList = document.getElementById("appointmentList");
    const searchInput = document.getElementById("searchInput");
    const filterStatus = document.getElementById("filterStatus");
    const sortBy = document.getElementById("sortBy");

// FILTER / SEARCH / SORT
    function getFilteredAppointments() {

        let filtered = allAppointments.filter(app => app.username === username);

        const searchValue = searchInput.value.toLowerCase().trim();
        const statusValue = filterStatus.value;
        const sortValue = sortBy.value;

 // SEARCH
        if (searchValue) {
            filtered = filtered.filter(app =>
                app.doctor.toLowerCase().includes(searchValue) ||
                (app.department || "").toLowerCase().includes(searchValue)
            );
        }

// FILTER
        if (statusValue !== "all") {
            filtered = filtered.filter(app => app.status === statusValue);
        }

// SORT
        filtered.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return sortValue === "newest"
                ? dateB - dateA
                : dateA - dateB;
        });

        return filtered;
    }

// UPDATE STATS
    function updateStats() {
        const userAppointments = allAppointments.filter(app => app.username === username);

        totalAppointments.textContent = userAppointments.length;
        upcomingAppointments.textContent =
            userAppointments.filter(a => a.status === "upcoming").length;
        completedAppointments.textContent =
            userAppointments.filter(a => a.status === "completed").length;
    }

// RENDER APPOINTMENTS
    function renderAppointments() {

        const appointments = getFilteredAppointments();
        appointmentList.innerHTML = "";

        if (appointments.length === 0) {
            appointmentList.innerHTML = `
                <div class="empty-state">
                    <p>No appointments found.</p>
                </div>
            `;
            return;
        }

        appointments.forEach(app => {

            const card = document.createElement("div");
            card.className = "appointment-card";

            const statusClass =
                app.status === "upcoming" ? "status-upcoming" :
                app.status === "completed" ? "status-completed" :
                "status-cancelled";

            card.innerHTML = `
                <div class="appointment-header">
                    <h3>${app.doctor}</h3>
                    <span class="status-badge ${statusClass}">
                        ${app.status}
                    </span>
                </div>

                <div class="appointment-details">
                    <p><strong>Department:</strong> ${app.department || "General"}</p>
                    <p><strong>Date:</strong> ${app.date}</p>
                    <p><strong>Time:</strong> ${app.time}</p>
                    <p><strong>Type:</strong> ${app.type || "In-Person"}</p>
                    <p><strong>Notes:</strong> ${app.notes || "N/A"}</p>
                </div>

                ${app.status === "upcoming" ? `
                    <button class="cancel-btn" data-id="${app.id}">
                        Cancel
                    </button>
                ` : ""}
            `;

            appointmentList.appendChild(card);
        });

        attachCancelEvents();
    }

// CANCEL APPOINTMENT
    function attachCancelEvents() {

        document.querySelectorAll(".cancel-btn").forEach(btn => {
            btn.addEventListener("click", function () {

                const id = this.dataset.id;

                if (!confirm("Cancel this appointment?")) return;

                allAppointments = allAppointments.map(app =>
                    app.id === id
                        ? { ...app, status: "cancelled" }
                        : app
                );

                saveAppointments(allAppointments);

                updateStats();
                renderAppointments();
            });
        });
    }


//EVENT LISTENERS
    searchInput.addEventListener("input", renderAppointments);
    filterStatus.addEventListener("change", renderAppointments);
    sortBy.addEventListener("change", renderAppointments);

// INITIAL LOAD
    updateStats();
    renderAppointments();

});