document.addEventListener("DOMContentLoaded", function () {

// LOGIN CHECK
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const username = localStorage.getItem("loggedInUser");

    if (!isLoggedIn || !username) {
        window.location.replace("login.html");
        return;
    }

// LOGOUT
    const userArea = document.getElementById("userArea");
    userArea.innerHTML = `<button class="btn" id="logoutBtn">Logout</button>`;
    document.getElementById("logoutBtn").onclick = () => {
        if (!confirm("Are you sure you want to logout?")) return;
        localStorage.clear();
        window.location.replace("index.html");
    };

// ELEMENTS
    const departmentSelect = document.getElementById("department");
    const doctorSelect = document.getElementById("doctor");
    const dateInput = document.getElementById("date");
    const timeSelect = document.getElementById("time");
    const notesInput = document.getElementById("notes");
    const charCount = document.getElementById("charCount");
    const form = document.getElementById("appointmentForm");
    const message = document.getElementById("message");
    const submitBtn = document.getElementById("submitBtn");

// DOCTOR DATA
    const doctorsData = {
        Cardiology: [
            { name: "Dr. Payal Singh", availableDays: [1,3,5], startTime: "09:00", endTime: "14:00" },
            { name: "Dr. Emily Brown", availableDays: [2,4], startTime: "10:00", endTime: "16:00" }
        ],
        Dermatology: [
            { name: "Dr. Michael Lee", availableDays: [1,2,3], startTime: "11:00", endTime: "17:00" },
            { name: "Dr. Anna White", availableDays: [4,5], startTime: "09:30", endTime: "13:30" }
        ],
        Orthopedics: [
            { name: "Dr. Sarah Green", availableDays: [1,4], startTime: "08:00", endTime: "12:00" },
            { name: "Dr. David Black", availableDays: [3,5], startTime: "12:00", endTime: "18:00" }
        ]
    };

// LOAD DOCTORS
    departmentSelect.onchange = () => {

        doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;
        doctorSelect.disabled = !departmentSelect.value;
        dateInput.disabled = true;
        timeSelect.disabled = true;
        dateInput.value = "";
        timeSelect.innerHTML = `<option value="">Select Time</option>`;

        const doctors = doctorsData[departmentSelect.value] || [];

        doctors.forEach(doc => {
            const option = document.createElement("option");
            option.value = doc.name;
            option.textContent = doc.name;
            doctorSelect.appendChild(option);
        });
    };

// DOCTOR SELECTED 
    doctorSelect.addEventListener("change", () => {

        dateInput.value = "";
        timeSelect.innerHTML = `<option value="">Select Time</option>`;
        timeSelect.disabled = true;

        if (!doctorSelect.value) {
            dateInput.disabled = true;
            return;
        }

        dateInput.disabled = false;
        dateInput.min = new Date().toISOString().split("T")[0];

        const doctor = doctorsData[departmentSelect.value]
            .find(d => d.name === doctorSelect.value);

        dateInput.dataset.availableDays = JSON.stringify(doctor.availableDays);
        timeSelect.dataset.startTime = doctor.startTime;
        timeSelect.dataset.endTime = doctor.endTime;
    });

// DATE SELECTE
    dateInput.addEventListener("change", () => {

        const availableDays = JSON.parse(dateInput.dataset.availableDays || "[]");
        const selectedDate = new Date(dateInput.value);
        const day = selectedDate.getDay();

        if (!availableDays.includes(day)) {
            showMessage("Doctor is not available on selected day.", "red");
            dateInput.value = "";
            timeSelect.disabled = true;
            return;
        }

        generateTimeSlots(dateInput.value);
    });

// GENERATE TIME SLOTS
    function generateTimeSlots(selectedDate) {

        timeSelect.innerHTML = `<option value="">Select Time</option>`;

        const start = timeSelect.dataset.startTime;
        const end = timeSelect.dataset.endTime;

        let current = new Date(`1970-01-01T${start}`);
        const endTime = new Date(`1970-01-01T${end}`);

        const appointments = JSON.parse(localStorage.getItem("appointments")) || [];

        while (current <= endTime) {

            const hours = current.getHours().toString().padStart(2, "0");
            const minutes = current.getMinutes().toString().padStart(2, "0");
            const formatted = `${hours}:${minutes}`;

            const isBooked = appointments.some(app =>
                app.doctor === doctorSelect.value &&
                app.date === selectedDate &&
                app.time === formatted
            );

            if (!isBooked) {
                const option = document.createElement("option");
                option.value = formatted;
                option.textContent = formatted;
                timeSelect.appendChild(option);
            }

            current.setMinutes(current.getMinutes() + 30);
        }

        timeSelect.disabled = false;
    }

// CHARACTER COUNTER
    notesInput.oninput = () => {
        charCount.textContent = `${notesInput.value.length} / 200`;
    };

    function generateID() {
        return "APT-" + crypto.randomUUID();
    }

// SUBMIT
    form.onsubmit = function (e) {
        e.preventDefault();

        const department = departmentSelect.value;
        const doctor = doctorSelect.value;
        const date = dateInput.value;
        const time = timeSelect.value;
        const type = document.querySelector("input[name='type']:checked")?.value;
        const notes = notesInput.value;

        if (!department || !doctor || !date || !time || !type) {
            showMessage("Please fill all required fields!", "red");
            return;
        }

        const selectedDateTime = new Date(`${date}T${time}`);
        if (selectedDateTime.getTime() < Date.now()) {
            showMessage("You cannot book past time.", "red");
            return;
        }

        let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

        appointments.push({
            id: generateID(),
            department,
            doctor,
            date,
            time,
            type,
            notes,
            status: "upcoming",
            username
        });

        localStorage.setItem("appointments", JSON.stringify(appointments));

        form.reset();
        doctorSelect.disabled = true;
        dateInput.disabled = true;
        timeSelect.disabled = true;
        charCount.textContent = "0 / 200";

        showMessage("Appointment booked successfully!", "green");
    };

    function showMessage(text, color) {
        message.textContent = text;
        message.style.color = color;
        setTimeout(() => message.textContent = "", 4000);
    }

});