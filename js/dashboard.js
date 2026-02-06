// Configuración de la URL según tus archivos storage.js y perfil.js
const BASE_URL = "http://localhost:4000";

document.addEventListener("DOMContentLoaded", () => {
    // Iniciamos pintando los usuarios por defecto
    renderSection('users');
});

// Exponemos la función al objeto window para que los botones del HTML puedan verla
window.renderSection = async function(section) {
    const display = document.getElementById("mainDisplay");
    
    // Actualizamos el estilo de los botones para saber cuál está activo
    document.querySelectorAll('.btn-nav').forEach(btn => {
        btn.classList.replace('btn-primary', 'btn-outline-primary');
    });
    event.target.classList.replace('btn-outline-primary', 'btn-primary');

    display.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p>Buscando en la base de datos...</p></div>';

    try {
        if (section === 'users') {
            const res = await fetch(`${BASE_URL}/users`);
            const users = await res.json();
            paintUsers(users, display);
        } 
        else if (section === 'offers') {
            const res = await fetch(`${BASE_URL}/jobOffers`);
            const offers = await res.json();
            paintOffers(offers, display);
        }
        else if (section === 'matches') {
            // Cruce de datos: Traemos usuarios y ofertas para poner nombres en lugar de IDs
            const [matches, users, jobs] = await Promise.all([
                fetch(`${BASE_URL}/matches`).then(r => r.json()),
                fetch(`${BASE_URL}/users`).then(r => r.json()),
                fetch(`${BASE_URL}/jobOffers`).then(r => r.json())
            ]);
            paintMatches(matches, users, jobs, display);
        }
    } catch (error) {
        display.innerHTML = `
            <div class="alert alert-danger">
                <strong>Error de conexión:</strong> No se pudo conectar con el servidor en el puerto 4000. 
                <br>Verifica que npx json-server esté corriendo.
            </div>`;
    }
}

// --- FUNCIONES PARA PINTAR (RENDERIZADO) ---

function paintUsers(users, container) {
    let html = `
        <h5 class="mb-3">Usuarios en la Plataforma (${users.length})</h5>
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr>
            </thead>
            <tbody>`;
    
    users.forEach(u => {
        html += `
            <tr>
                <td><strong>${u.firstName} ${u.lastName}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'candidate' ? 'bg-info text-dark' : 'bg-success'}">${u.role}</span></td>
                <td>${u.status ? '✅' : '➖'}</td>
            </tr>`;
    });
    container.innerHTML = html + `</tbody></table>`;
}

function paintOffers(offers, container) {
    let html = `<h5 class="mb-3">Ofertas Laborales Activas</h5><div class="row">`;
    
    offers.forEach(j => {
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100 border-start border-primary border-4 shadow-sm">
                    <div class="card-body">
                        <h6 class="card-title fw-bold">${j.title}</h6>
                        <p class="small text-muted mb-2">${j.modality}</p>
                        <span class="badge rounded-pill bg-light text-primary border border-primary">${j.status}</span>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html + `</div>`;
}

function paintMatches(matches, users, jobs, container) {
    let html = `
        <h5 class="mb-3">Monitor de Aplicaciones (Matches)</h5>
        <table class="table table-sm">
            <thead>
                <tr><th>Candidato</th><th>Empresa</th><th>Posición</th><th>Estado</th></tr>
            </thead>
            <tbody>`;

    matches.forEach(m => {
        const cand = users.find(u => u.id === m.candidateId) || {firstName: "N/A", lastName: ""};
        const emp = users.find(u => u.id === m.companyId) || {firstName: "Empresa"};
        const job = jobs.find(j => j.id === m.jobOfferId) || {title: "Oferta eliminada"};

        html += `
            <tr>
                <td>${cand.firstName} ${cand.lastName}</td>
                <td>${emp.firstName}</td>
                <td>${job.title}</td>
                <td><span class="badge bg-warning text-dark">${m.status}</span></td>
            </tr>`;
    });
    container.innerHTML = html + `</tbody></table>`;
}