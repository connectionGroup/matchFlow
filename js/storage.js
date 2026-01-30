const API_URL = "http://localhost:3000/user";
const container = document.querySelector('.candidates-grid');

async function renderCandidates() {
    try {
        const response = await fetch(API_URL);
        const candidates = await response.json();
        
        container.innerHTML = "";

        candidates.forEach(user => {
            const isReserved = user.status === "reserved";
            
            const card = document.createElement('div');
            card.className = 'candidate-card';
            card.innerHTML = `
                <h3>${user.name}</h3>
                <p class="candidate-role">Fullstack Developer</p>
                <p class="candidate-skills">ID: ${user.id} • ${user.status}</p>
                
                <div class="candidate-actions">
                    ${isReserved 
                        ? `<span class="badge">Reservado</span>
                           <button class="btn btn-secondary" onclick="updateStatus(${user.id}, 'available')">Liberar</button>`
                        : `<button class="btn btn-primary" onclick="updateStatus(${user.id}, 'reserved')">Book</button>`
                    }
                    <button class="btn btn-outline">View Profile</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error cargando candidatos:", error);
    }
}

async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {

            renderCandidates(); 
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
    }
}

document.addEventListener('DOMContentLoaded', renderCandidates);