/***********************
 * CONFIG
 ***********************/
const API_URL = "http://localhost:3000";
const container = document.querySelector(".candidates-grid");
const searchInput = document.getElementById("searchInput");

/***********************
 * SESSION (MOCK)
 ***********************/
const isLogged = true;

const currentUser = {
  role: "company",
  companyId: "4401"
};

const currentJobOfferId = "e829";

/***********************
 * STATE
 ***********************/

let candidates = [];
let reservations = [];

/***********************
 * LOAD DATA
 ***********************/
async function loadData() {
  try {
    const [cRes, rRes] = await Promise.all([
      fetch(`${API_URL}/candidates`),
      fetch(`${API_URL}/reservations`)
    ]);

    candidates = await cRes.json();
    reservations = await rRes.json();

    renderCandidates(searchCandidates(""));
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

/***********************
 * RESERVATION LOGIC
 ***********************/
function isCandidateReserved(candidateId) {
  return reservations.some(
    r => r.active === true && r.candidateId === candidateId
  );
}

/***********************
 * VISIBILITY RULES
 ***********************/
function canSeeCandidate(candidate) {
  if (!isLogged) return false;
  if (currentUser.role !== "company") return false;
  if (!candidate.openToWork) return false;
  if (isCandidateReserved(candidate.id)) return false;
  return true;
}

/***********************
 * SEARCH
 ***********************/
function searchCandidates(text) {
  const query = text.toLowerCase().trim();

  return candidates
    .filter(canSeeCandidate)
    .filter(c =>
      c.fullName.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      c.skills.some(skill =>
        skill.toLowerCase().includes(query)
      )
    );
}

/***********************
 * RESERVE
 ***********************/
async function reserveCandidate(candidateId) {
  if (isCandidateReserved(candidateId)) return;

  const reservation = {
    candidateId,
    companyId: currentUser.companyId,
    jobOfferId: currentJobOfferId,
    active: true
  };

  await fetch(`${API_URL}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservation)
  });

  loadData();
}
async function createMatch(candidateId) {
  const match = {
    companyId: currentUser.companyId,
    jobOfferId: currentJobOfferId,
    candidateId: candidateId,
    status: "pending"
  };

  await fetch(`${API_URL}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(match)
  });

  // redirige a la página donde está la tabla
  window.location.href = "../pages/marches.html";
}


/***********************
 * RELEASE
 ***********************/
async function releaseReservation(candidateId) {
  const reservation = reservations.find(
    r =>
      r.active &&
      r.candidateId === candidateId &&
      r.companyId === currentUser.companyId
  );

  if (!reservation) return;

  await fetch(`${API_URL}/reservations/${reservation.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active: false })
  });

  loadData();
}

/***********************
 * RENDER
***********************/
function renderCandidates(list) {
  container.innerHTML = "";

  if (!isLogged) {
    container.innerHTML = "<p>Debes iniciar sesión</p>";
    return;
  }

  if (currentUser.role !== "company") {
    container.innerHTML = "<p>Solo las empresas pueden ver candidatos</p>";
    return;
  }

  if (list.length === 0) {
    container.innerHTML = "<p>No hay candidatos disponibles</p>";
    return;
  }

  list.forEach(c => {
    const isReserved = isCandidateReserved(c.id);

    const card = document.createElement("div");
    card.className = "candidate-card";

    card.innerHTML = `
    <h3>${c.fullName}</h3>
    <p class="candidate-role">${c.title}</p>
    <p class="candidate-skills">${c.skills.join(", ")}</p>
    
    <div class="candidate-actions">
    ${isReserved
        ? `<span class="badge">Reservado</span>
      <button class="btn btn-secondary"
      onclick="releaseReservation('${c.id}')">
      Liberar
      </button>`
        : `<button class="btn btn-primary"
      onclick="reserveCandidate('${c.id}')">
      Reservar
      </button>`
      }
    
    <!-- BOTÓN MATCH (SOLO VISUAL) -->
    <button class="btn btn-success"
      onclick="createMatch('${c.id}')">
      Match
    </button>

    
    <button class="btn btn-outline">Ver perfil</button>
    </div>
    `;

    container.appendChild(card);
  });
}

/***********************
 * EVENTS
 ***********************/
if (searchInput) {
  searchInput.addEventListener("input", e => {
    renderCandidates(searchCandidates(e.target.value));
  });
}

/***********************
 * INIT
 ***********************/
loadData();
