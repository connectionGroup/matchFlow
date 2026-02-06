import { getData, patchData, checkCandidateAvailability } from "./api.js";
// 1. Adaptamos la key: login.js guarda "user", no "currentUser"
let userSession = JSON.parse(localStorage.getItem("user"));
let candidateData = null; // Aquí guardaremos la info de la tabla 'candidates'

document.addEventListener("DOMContentLoaded", async () => {
    // Sincronización para auth.js (si login.js no lo seteó)
    if (userSession && !localStorage.getItem('isAuthenticated')) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', userSession.role);
    }

    // Validación de sesión y rol
    if (!userSession || userSession.role !== 'candidate') {
        logout();
        return;
    }

    // 2. Carga de datos Relacionales (Users -> Candidates)
    try {
        // Usamos el candidateId que viene en el usuario logueado para buscar su perfil real
        candidateData = await getData(`candidates/${userSession.candidateId}`);
        
        if (!candidateData) throw new Error("Perfil de candidato no encontrado");

        initDashboard();
    } catch (error) {
        console.error("Error crítico cargando perfil:", error);
        alert("Error al cargar tu perfil. Contacta soporte.");
        logout();
    }
});

function initDashboard() {
    // Nombre de bienvenida (usando candidateData)
    const welcomeElem = document.getElementById("welcomeName");
    if (welcomeElem) welcomeElem.innerText = `Hola, ${candidateData.fullName.split(' ')[0]}`;

// Cargar componentes
    renderSidebarStatus();
    renderPlanInfo(); // <--- NUEVA FUNCIÓN
    loadJobs();
    loadMatches();
    populateProfileView();

    // Listeners
    document.getElementById("btnLogout").addEventListener("click", logout);
    document.getElementById("formProfile").addEventListener("submit", updateProfile);
    document.getElementById("openToWorkToggle").addEventListener("change", toggleOpenToWork);
}

// --- NUEVA LÓGICA DE PLANES ---
async function renderPlanInfo() {
    // Usamos la lógica centralizada en api.js
    const availability = await checkCandidateAvailability(candidateData.id);
    
    // 1. Actualizar Badge del Plan
    const badge = document.getElementById("userPlanBadge");
    badge.innerHTML = `<i class="bi bi-star-fill"></i> PLAN ${availability.currentPlan.toUpperCase()}`;
    
    // Colores según plan
    if(availability.currentPlan === 'free') badge.className = "badge rounded-pill bg-secondary text-white mt-1";
    if(availability.currentPlan === 'pro1') badge.className = "badge rounded-pill bg-primary text-white mt-1";
    if(availability.currentPlan === 'pro2') badge.className = "badge rounded-pill bg-dark text-warning border border-warning mt-1";

    // 2. Actualizar Barra de Progreso
    const counter = document.getElementById("reservationCounter");
    const progress = document.getElementById("reservationProgress");
    
    counter.innerText = `${availability.usedSlots}/${availability.maxSlots}`;
    
    const percentage = (availability.usedSlots / availability.maxSlots) * 100;
    progress.style.width = `${percentage}%`;
    
    // Color de barra: Roja si está lleno, Verde si hay espacio
    if(percentage >= 100) {
        progress.classList.remove('bg-success', 'bg-warning');
        progress.classList.add('bg-danger');
    } else {
        progress.classList.remove('bg-danger', 'bg-warning');
        progress.classList.add('bg-success');
    }
}


// --- SISTEMA DE TABS ---
window.switchTab = function (tabName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));

    document.getElementById(`view-${tabName}`).classList.remove('d-none');

    // Activar botón del menú (índices basados en el orden del HTML)
    const buttons = document.querySelectorAll('.list-group-item');
    if (tabName === 'jobs') buttons[0].classList.add('active');
    if (tabName === 'matches') buttons[1].classList.add('active');
    if (tabName === 'profile') buttons[2].classList.add('active');
};

// --- SIDEBAR ESTADO ---
function renderSidebarStatus() {
    const toggle = document.getElementById("openToWorkToggle");
    const container = document.getElementById("statusContainer");
    const label = document.getElementById("statusLabel");

    toggle.checked = candidateData.openToWork;

    if (candidateData.openToWork) {
        container.className = "status-box p-2 rounded text-center mb-4 bg-success-subtle border border-success";
        label.innerText = "Buscando empleo";
        label.className = "fw-semibold d-block mt-2 text-success";
    } else {
        container.className = "status-box p-2 rounded text-center mb-4 bg-light border";
        label.innerText = "No disponible";
        label.className = "fw-semibold d-block mt-2 text-muted";
    }
}

async function toggleOpenToWork() {
    const newState = document.getElementById("openToWorkToggle").checked;
    try {
        // Actualizamos en la tabla 'candidates' usando patchData de tu api.js
        await patchData("candidates", candidateData.id, { openToWork: newState });
        
        candidateData.openToWork = newState;
        renderSidebarStatus();
    } catch (error) {
        console.error("Error toggle:", error);
        document.getElementById("openToWorkToggle").checked = !newState; // Revertir visualmente
        alert("No se pudo cambiar el estado.");
    }
}

// --- PERFIL ---
function populateProfileView() {
    // Vista Lectura
    document.getElementById("profileNameDisplay").innerText = candidateData.fullName;
    document.getElementById("profileTitleDisplay").innerText = candidateData.title || "Sin título definido";
    document.getElementById("profileEmail").innerText = userSession.email; // Email viene de 'users'
    document.getElementById("profilePhone").innerText = candidateData.contact?.phone || "No registrado";
    document.getElementById("profileCity").innerText = "Remoto / No especificado"; 
    document.getElementById("profileExp").innerText = candidateData.experience || "0 años";

    const skillsContainer = document.getElementById("profileSkillsContainer");
    skillsContainer.innerHTML = "";
    
    if (candidateData.skills && candidateData.skills.length > 0) {
        candidateData.skills.forEach(skill => {
            skillsContainer.innerHTML += `<span class="badge bg-primary me-1">${skill}</span>`;
        });
    } else {
        skillsContainer.innerHTML = "<span class='text-muted small'>Sin habilidades registradas</span>";
    }

    // Pre-llenar Modal
    document.getElementById("profName").value = candidateData.fullName || "";
    document.getElementById("profTitle").value = candidateData.title || "";
    document.getElementById("profExp").value = candidateData.experience || "";
    document.getElementById("profPhone").value = candidateData.contact?.phone || "";
    document.getElementById("profSkills").value = candidateData.skills ? candidateData.skills.join(", ") : "";
}

async function updateProfile(e) {
    e.preventDefault();

    const updatedInfo = {
        fullName: document.getElementById("profName").value,
        title: document.getElementById("profTitle").value,
        experience: document.getElementById("profExp").value,
        contact: {
            phone: document.getElementById("profPhone").value,
            whatsapp: candidateData.contact?.whatsapp || ""
        },
        skills: document.getElementById("profSkills").value
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
    };

    try {
        // Actualizar en DB
        await patchData("candidates", candidateData.id, updatedInfo);

        // Actualizar Local
        candidateData = { ...candidateData, ...updatedInfo };

        // Cerrar Modal
        const modalEl = document.getElementById('profileModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        populateProfileView();
        document.getElementById("welcomeName").innerText = `Hola, ${candidateData.fullName.split(' ')[0]}`;
        
        // Usando alert nativo porque Swal no está importado aquí, 
        // pero puedes usar Swal si lo importas en el HTML
        alert("Perfil actualizado correctamente");

    } catch (error) {
        console.error(error);
        alert("Error al actualizar perfil");
    }
}

// --- DETALLE DE OFERTA ---
// Hacemos la función global asignándola a window para que el HTML pueda llamarla
window.viewJobDetail = async function(jobId) {
    try {
        // Buscamos la oferta específica expandiendo la info de la empresa
        const job = await getData(`jobOffers/${jobId}?_expand=company`);
        
        if (!job) throw new Error("Oferta no encontrada");

        // Llenar datos del modal
        document.getElementById("modalJobLogo").src = job.company?.logo || 'https://via.placeholder.com/60';
        document.getElementById("modalJobTitle").innerText = job.title;
        document.getElementById("modalJobCompany").innerText = job.company?.name || 'Empresa Confidencial';
        document.getElementById("modalJobModality").innerText = job.modality;
        document.getElementById("modalJobDetails").innerText = job.details;

        // Mostrar el modal usando Bootstrap
        const modal = new bootstrap.Modal(document.getElementById('jobDetailModal'));
        modal.show();

    } catch (error) {
        console.error("Error al cargar detalle:", error);
        alert("No se pudieron cargar los detalles de la oferta.");
    }
};

// --- FUNCIÓN DEMO PARA MEJORAR PLAN ---
window.upgradePlanDemo = async function() {
    // Si no tienes SweetAlert cargado en el HTML, esto dará error en consola
    if (typeof Swal === 'undefined') {
        alert("Error: Falta la librería SweetAlert2 en el HTML");
        return;
    }

    const { value: plan } = await Swal.fire({
        title: 'Mejorar Suscripción',
        html: '<p class="small text-muted">Simula la compra de un plan superior</p>',
        input: 'select',
        inputOptions: {
            'free': 'Free (Máx 1 Reserva)',
            'pro1': 'Pro Level 1 (Máx 2 Reservas)',
            'pro2': 'Pro Level 2 (Máx 5 Reservas)'
        },
        inputValue: candidateData.plan, // Selecciona el actual por defecto
        inputPlaceholder: 'Selecciona un plan',
        showCancelButton: true,
        confirmButtonText: 'Actualizar Plan',
        confirmButtonColor: '#ffc107',
        cancelButtonText: 'Cancelar'
    });

    if (plan) {
        try {
            // Actualizar en DB
            await patchData("candidates", candidateData.id, { plan: plan });
            
            // Actualizar localmente y refrescar UI
            candidateData.plan = plan;
            await renderPlanInfo(); 
            
            Swal.fire({
                icon: 'success',
                title: '¡Plan Actualizado!',
                text: `Ahora disfrutas de los beneficios del plan ${plan.toUpperCase()}`,
                timer: 2000
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar el plan', 'error');
        }
    }
}

// --- OFERTAS (JOBS) ---
async function loadJobs() {
    const container = document.getElementById("jobsList");
    container.innerHTML = "<p class='text-center py-3'>Cargando ofertas...</p>";

    try {
        const jobs = await getData("jobOffers?_expand=company");
        
        container.innerHTML = "";

        if (jobs.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted">No hay ofertas disponibles.</div>`;
            return;
        }

        jobs.forEach(job => {
            if(job.status !== 'open') return; 

            const card = `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex align-items-center mb-3">
                                <img src="${job.company?.logo || 'https://via.placeholder.com/40'}" class="rounded-circle me-2 border" width="40" height="40">
                                <div>
                                    <h6 class="card-title fw-bold mb-0 text-truncate" style="max-width: 150px;">${job.title}</h6>
                                    <small class="text-muted">${job.company?.name || 'Empresa Confidencial'}</small>
                                </div>
                            </div>
                            <span class="badge bg-light text-dark border mb-2 align-self-start">${job.modality}</span>
                            <p class="card-text small text-muted text-truncate flex-grow-1">${job.details}</p>
                            
                            <button class="btn btn-outline-primary btn-sm w-100 mt-2" onclick="window.viewJobDetail('${job.id}')">
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>`;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-danger">Error cargando ofertas.</div>`;
    }
}

// --- MATCHES ---
async function loadMatches() {
    const container = document.getElementById("matchesList");
    const counterBadge = document.getElementById("matchCount");

    try {
        // Traer matches del candidato expandiendo Oferta y Empresa
        const matches = await getData(`matches?candidateId=${candidateData.id}&_expand=jobOffer&_expand=company`);

        counterBadge.innerText = matches.length;
        container.innerHTML = "";

        if (matches.length === 0) {
            container.innerHTML = `<div class="alert alert-info text-center">Aún no tienes solicitudes.</div>`;
            return;
        }

        matches.forEach(match => {
            const statusColors = {
                'pending': 'bg-warning',
                'interview': 'bg-info',
                'hired': 'bg-success',
                'contacted': 'bg-primary',
                'discarded': 'bg-secondary'
            };
            const badgeClass = statusColors[match.status] || 'bg-secondary';

            const card = `
                <div class="col-12">
                    <div class="card mb-2 shadow-sm border-start border-4 border-primary">
                        <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <h6 class="fw-bold mb-1">${match.jobOffer?.title || 'Puesto desconocido'}</h6>
                                <p class="mb-0 small text-muted">${match.company?.name || 'Empresa'}</p>
                            </div>
                            <div class="text-end">
                                <span class="badge ${badgeClass} text-dark mb-1">${match.status.toUpperCase()}</span>
                                <br>
                                <small class="text-muted" style="font-size: 0.7rem">Match ID: ${match.id}</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="text-danger">Error cargando matches.</div>`;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "../index.html"; // Ajusta esta ruta si tu login está en la raíz o en pages/
}