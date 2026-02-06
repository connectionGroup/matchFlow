import { getData, postData } from "./api.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");
const roleSelect = document.getElementById("roleSelect");
const companyFields = document.getElementById("companyFields");

// ======================
// Cambiar entre forms
// ======================
goRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("d-none");
    registerForm.classList.remove("d-none");
});

goLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.add("d-none");
    loginForm.classList.remove("d-none");
});

// ======================
// Mostrar campos de company
// ======================
roleSelect.addEventListener("change", () => {
    if (roleSelect.value === "company") companyFields.classList.remove("d-none");
    else companyFields.classList.add("d-none");
});

// ======================
// LOGIN
// ======================
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const data = Object.fromEntries(new FormData(loginForm).entries());
        const users = await getData(`users?email=${encodeURIComponent(data.email)}&password=${encodeURIComponent(data.password)}`);

        if (!users.length) {
            // SweetAlert2 estilo original
            Swal.fire("Error", "Invalid email or password", "error");
            return;
        }

        const user = users[0];
        localStorage.setItem("user", JSON.stringify(user));

        // SweetAlert2 al login exitoso
        await Swal.fire("Success", "Login successful", "success");

        // Redirigir según rol
        if (user.role === "admin") {
            window.location.href = "/pages/dashboard.html";
        } else if (user.role === "company") {
            window.location.href = "/pages/company.html";
        } else {
            window.location.href = "/pages/candidate.html";
        }

    } catch (err) {
        Swal.fire("Error", err.message, "error");
    }
});

// ======================
// REGISTER
// ======================
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const data = Object.fromEntries(new FormData(registerForm).entries());

        if (data.role === "company" && !data.companyName) {
            Swal.fire("Error", "Company name is required", "error");
            return;
        }

        const existing = await getData(`users?email=${encodeURIComponent(data.email)}`);
        if (existing.length) {
            Swal.fire("Error", "User already exists", "error");
            return;
        }

        await Swal.fire("Success", "Account created successfully ", "success");

        const userPayload = { email: data.email, password: data.password, role: data.role };

        // Candidate
        if (data.role === "candidate") {
            const candidate = await postData("candidates", {
                fullName: `${data.firstName} ${data.lastName}`,
                title: "",
                skills: [],
                experience: "",
                openToWork: true,
                contact: { phone: "", whatsapp: "" }
            });
            userPayload.candidateId = candidate.id;
        }

        // Company
        if (data.role === "company") {
            const company = await postData("companies", {
                name: data.companyName,
                email: data.email,
                description: data.companyDescription || "",
                industry: "",
                catchPhrase: "",
                logo: "https://www.svgrepo.com/show/303106/mcdonald-s-15-logo.svg"
            });
            userPayload.companyId = company.id;
        }

        await postData("users", userPayload);

        registerForm.reset();
        registerForm.classList.add("d-none");
        loginForm.classList.remove("d-none");

    } catch (err) {
        Swal.fire("Error", err.message, "error");
    }
});
