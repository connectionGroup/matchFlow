const API_URL = "http://localhost:4001";
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

// 🔥 SESIÓN QUEMADA PARA DESARROLLO
if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", JSON.stringify({
        id: "2f5a",
        email: "leah@mail.com",
        role: "candidate",
        candidateId: "29c4"
    }));
}

document.addEventListener("DOMContentLoaded", () => {
    // Sincronización de sesión
    if (currentUser && !localStorage.getItem('isAuthenticated')) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', currentUser.role);
    }

    // Validación de rol
    if (!currentUser || currentUser.role !== 'candidate') {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    initDashboard();
});

async function initDashboard() {
    const welcomeElem = document.getElementById("welcomeName");

    const profile = await loadCandidateProfile();
    currentUser.candidateProfile = profile;

    if (welcomeElem) {
        welcomeElem.innerText = `Hola, ${profile.fullName}`;
    }

    renderSidebarStatus();
    loadJobs();
    loadMatches();
    populateProfileView();

    document.getElementById("btnLogout").addEventListener("click", logout);
    // document.getElementById("formProfile").addEventListener("submit", updateProfile);
    document.getElementById("openToWorkToggle").addEventListener("change", toggleOpenToWork);
}


async function loadCandidateProfile() {
    const response = await fetch(`${API_URL}/candidates/${currentUser.candidateId}`);
    if (!response.ok) throw new Error("Perfil no encontrado");
    return await response.json();
}


// --- SISTEMA DE PESTAÑAS (TABS) ---
window.switchTab = function (tabName) {
    // ocultar vistas
    document.querySelectorAll('.view-section')
        .forEach(v => v.classList.add('d-none'));

    // desactivar botones
    document.querySelectorAll('.nav-btn')
        .forEach(b => b.classList.remove('active'));

    // mostrar vista
    document.getElementById(`view-${tabName}`)
        .classList.remove('d-none');

    // activar botón
    const index = { jobs: 0, matches: 1, profile: 2 }[tabName];
    document.querySelectorAll('.nav-btn')[index].classList.add('active');

    if (tabName === 'matches') loadMatches();
    if (tabName === 'profile') populateProfileView();
};


// --- LOGICA DE PERFIL Y SIDEBAR ---
function renderSidebarStatus() {
    const profile = currentUser.candidateProfile || {};
    const toggle = document.getElementById("openToWorkToggle");
    const container = document.getElementById("statusContainer");
    const label = document.getElementById("statusLabel");

    toggle.checked = profile.openToWork;

    if (profile.openToWork) {
        container.className = "status-box p-2 rounded text-center mb-4 status-active";
        label.innerText = "Estado: Visible";
    } else {
        container.className = "status-box p-2 rounded text-center mb-4 status-inactive";
        label.innerText = "Estado: Oculto";
    }
}

function populateProfileView() {
    const profile = currentUser.candidateProfile;

    document.getElementById("profileNameDisplay").innerText = profile.fullName;
    document.getElementById("profileTitleDisplay").innerText = profile.title;
    document.getElementById("profileEmail").innerText = currentUser.email;
    // document.getElementById("profilePhone").innerText = profile.contact?.phone || "-";
    document.getElementById("profileCity").innerText = profile.city || "-";
    // document.getElementById("profileBirth").innerText = profile.birthdate || "-";
    // document.getElementById("profileExp").innerText = profile.experience || "0";

    const skillsContainer = document.getElementById("profileSkillsContainer");
    skillsContainer.innerHTML = "";

    profile.skills.forEach(skill => {
        skillsContainer.innerHTML += `<span class="badge-skill">${skill}</span>`;
    });

    // Modal
    document.getElementById("profTitle").value = profile.title;
    document.getElementById("profCity").value = profile.city || "";
    document.getElementById("profExp").value = profile.experience || "";
    document.getElementById("profBirth").value = profile.birthdate || "";
    document.getElementById("profPhone").value = profile.contact?.phone || "";
    document.getElementById("profSkills").value = profile.skills.join(", ");
}


async function updateProfile(e) {
    e.preventDefault();

    const updatedProfile = {
        ...currentUser.candidateProfile,
        title: profTitle.value,
        city: profCity.value,
        experience: profExp.value,
        birthdate: profBirth.value,
        skills: profSkills.value.split(",").map(s => s.trim()),
        contact: {
            phone: profPhone.value,
            whatsapp: currentUser.candidateProfile.contact?.whatsapp
        },
        openToWork: openToWorkToggle.checked
    };

    await fetch(`${API_URL}/candidates/${currentUser.candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
    });

    currentUser.candidateProfile = updatedProfile;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    Swal.fire("Guardado", "Perfil actualizado", "success");
    bootstrap.Modal.getInstance(profileModal).hide();
}


async function toggleOpenToWork() {
    const newState = openToWorkToggle.checked;

    await fetch(`${API_URL}/candidates/${currentUser.candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openToWork: newState })
    });

    currentUser.candidateProfile.openToWork = newState;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    renderSidebarStatus();
}


// --- LOGICA DE OFERTAS (JOBS) ---
async function loadJobs() {
    const container = document.getElementById("jobsList");
    container.innerHTML = "";

    const [jobsRes, companiesRes] = await Promise.all([
        fetch(`${API_URL}/jobOffers`),
        fetch(`${API_URL}/companies`)
    ]);

    const jobs = await jobsRes.json();
    const companies = await companiesRes.json();

    jobs.forEach(job => {
        const company = companies.find(c => c.id === job.companyId);

        container.innerHTML += `
        <div class="col-md-6">
            <div class="job-card">
                <h6>${job.title}</h6>
                <p class="text-muted small">${company?.name}</p>
                <button class="btn btn-sm btn-outline-dark"
                    onclick="viewJobDetail('${job.id}')">
                    Ver más
                </button>
            </div>
        </div>`;
    });
}


// Función para abrir el Modal de Detalle
// window.viewJobDetail = async function (jobId) {
//     try {
//         const response = await fetch(`${API_URL}/jobs/${jobId}`);
//         const job = await response.json();

//         document.getElementById("modalJobTitle").innerText = job.title;
//         document.getElementById("modalJobCompany").innerText = job.companyName;
//         document.getElementById("modalJobDesc").innerText = job.description || "Sin descripción detallada.";

//         const skillsContainer = document.getElementById("modalJobSkills");
//         skillsContainer.innerHTML = job.skills ? job.skills.map(s => `<span class="badge bg-light text-dark border">${s}</span>`).join('') : "No especificados";

//         const modal = new bootstrap.Modal(document.getElementById('jobDetailModal'));
//         modal.show();
//     } catch (error) {
//         Swal.fire("Error", "No se pudo cargar el detalle.", "error");
//     }
// };

// --- LOGICA DE MATCHES ---
async function loadMatches() {
    const container = document.getElementById("matchesList");
    const counterBadge = document.getElementById("matchCount");

    try {
        // json-server permite expandir relaciones. Usamos _expand para traer datos del job
        // Nota: Asumimos que el match tiene jobId y companyId
        const response = await fetch(`${API_URL}/matches?candidateId=${currentUser.candidateId}`);
        const matches = await response.json();

        // Filtramos solo los pendientes para la vista principal
        const pendingMatches = matches.filter(m => m.status === 'pending');

        // Actualizar contador
        counterBadge.innerText = pendingMatches.length;
        if (pendingMatches.length > 0) counterBadge.classList.remove('d-none');

        container.innerHTML = "";

        if (pendingMatches.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-emoji-neutral text-muted" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-2">No tienes solicitudes pendientes.</p>
                </div>`;
            return;
        }

        pendingMatches.forEach(match => {
            const jobTitle = match.job ? match.job.title : "Posición desconocida";
            const companyName = match.job ? match.job.companyName : "Empresa";

            const card = `
                <div class="col-12">
                    <div class="login-card p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <span class="badge bg-warning text-dark mb-1">Nueva Solicitud</span>
                            <h6 class="fw-bold mb-0">${jobTitle}</h6>
                            <p class="small text-muted mb-0">De: ${companyName}</p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-danger" onclick="respondMatch('${match.id}', 'discarded')">
                                <i class="bi bi-x-lg"></i> Rechazar
                            </button>
                            <button class="btn btn-sm btn-success text-white" onclick="respondMatch('${match.id}', 'contacted')">
                                <i class="bi bi-check-lg"></i> Aceptar
                            </button>
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

window.respondMatch = async function (matchId, newStatus) {
    const actionText = newStatus === 'contacted' ? 'Aceptar' : 'Rechazar';

    const result = await Swal.fire({
        title: `¿${actionText} solicitud?`,
        text: newStatus === 'contacted' ? "La empresa recibirá tus datos de contacto." : "Esta oferta desaparecerá de tu lista.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: newStatus === 'contacted' ? '#198754' : '#d33',
        confirmButtonText: `Sí, ${actionText}`
    });

    if (result.isConfirmed) {
        try {
            await fetch(`${API_URL}/matches/${matchId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            Swal.fire("Listo", `Solicitud ${newStatus === 'contacted' ? 'aceptada' : 'rechazada'}.`, "success");
            loadMatches(); // Recargar lista
        } catch (error) {
            Swal.fire("Error", "No se pudo actualizar el match.", "error");
        }
    }
};

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    window.location.href = "login.html";
}