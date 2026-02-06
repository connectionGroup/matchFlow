import { getData, postData } from "./api.js";
import { login as loginUser, redirectToRoleHomepage, isAuthenticated } from "./auth.js";

// Si el usuario ya está autenticado, redirigirlo a su página principal.
if (isAuthenticated()) {
    redirectToRoleHomepage(JSON.parse(localStorage.getItem('matchflow_user')).role);
}

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");
const roleSelect = document.getElementById("roleSelect");
const companyFields = document.getElementById("companyFields");

// ===================================================================
// MANEJO DE LA INTERFAZ: CAMBIAR ENTRE FORMULARIOS DE LOGIN/REGISTRO
// ===================================================================
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

// ===================================================================
// LÓGICA DE REGISTRO: MOSTRAR CAMPOS ADICIONALES PARA EMPRESAS
// ===================================================================
roleSelect.addEventListener("change", () => {
    if (roleSelect.value === "company") companyFields.classList.remove("d-none");
    else companyFields.classList.add("d-none");
});

// ===================================================================
// LÓGICA DE LOGIN DE USUARIO
// ===================================================================
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const data = Object.fromEntries(new FormData(loginForm).entries());

        Swal.fire({
            title: 'Signing In...',
            html: `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mb-2">Verifying your credentials</p>
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                             role="progressbar" 
                             style="width: 100%">
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });

        await new Promise(resolve => setTimeout(resolve, 1200));

        // --- FIX DE SEGURIDAD ---
        // 1. Se busca al usuario solo por email. NUNCA se debe pasar el password en la URL.
        const users = await getData(`users?email=${encodeURIComponent(data.email)}`);

        // 2. Se valida si el usuario existe y si la contraseña coincide.
        //    En una app real, las contraseñas estarían hasheadas (ej: con bcrypt).
        if (!users.length || users[0].password !== data.password) {
            Swal.fire("Error", "Invalid email or password", "error");
            return;
        }

        const user = users[0];

        // Usamos el módulo de autenticación para guardar la sesión.
        loginUser(user);

        // Notificación de éxito.
        await Swal.fire({
            title: 'Welcome Back!',
            html: `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                    <h4 class="mt-3">Login successful!</h4>
                    <p class="text-muted">Redirecting to your dashboard...</p>
                </div>
            `,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });

        // Redirigir al usuario a su página correspondiente.
        redirectToRoleHomepage(user.role);

    } catch (err) {
        Swal.fire("Error", err.message, "error");
    }
});

// ===================================================================
// LÓGICA DE REGISTRO DE NUEVO USUARIO
// ===================================================================
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

        Swal.fire({
            title: 'Creating Account...',
            html: `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mb-2">Setting up your MatchFlow account</p>
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                             role="progressbar" 
                             style="width: 100%">
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        // Payload base para el nuevo usuario en la colección 'users'.
        // Se asigna el plan "free" por defecto.
        const userPayload = {
            email: data.email,
            password: data.password, // En una app real, esto debería estar hasheado.
            role: data.role,
            plan: "free" // <-- NUEVA REGLA DE NEGOCIO: Plan por defecto.
        };

        // Candidate
        if (data.role === "candidate") {
            // Se crea el perfil del candidato con el plan por defecto.
            const candidate = await postData("candidates", {
                fullName: `${data.firstName} ${data.lastName}`,
                title: "",
                skills: [],
                experience: "",
                openToWork: true,
                contact: { phone: "", whatsapp: "" },
                plan: "free" // <-- NUEVA REGLA DE NEGOCIO: Plan por defecto.
            });
            // Se asocia el ID del perfil de candidato con la cuenta de usuario.
            userPayload.candidateId = candidate.id;
        }

        // Company
        if (data.role === "company") {
            // Se crea el perfil de la empresa con el plan por defecto.
            const company = await postData("companies", {
                name: data.companyName,
                email: data.email,
                description: data.companyDescription || "",
                industry: "",
                catchPhrase: "",
                logo: "https://www.svgrepo.com/show/303106/mcdonald-s-15-logo.svg",
                plan: "free" // <-- NUEVA REGLA DE NEGOCIO: Plan por defecto.
            });
            // Se asocia el ID del perfil de empresa con la cuenta de usuario.
            userPayload.companyId = company.id;
        }

        // Finalmente, se crea el registro en la colección 'users'.
        await postData("users", userPayload);

        await Swal.fire({
            title: 'Account Created!',
            html: `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                    <h4 class="mt-3">Welcome to MatchFlow!</h4>
                    <p class="text-muted">Your account has been created successfully</p>
                    <div class="alert alert-info mt-3">
                        <i class="bi bi-info-circle-fill"></i>
                        You can now login with your credentials
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'Login Now'
        });

        registerForm.reset();
        registerForm.classList.add("d-none");
        loginForm.classList.remove("d-none");

    } catch (err) {
        Swal.fire("Error", err.message, "error");
    }
});
