/***********************
 * CONFIG
 ***********************/
const API_URL = "http://localhost:3000";

// Mock sesión
const isLogged = true;
const currentUser = {
  role: "company",
  companyId: "4401"
};

/***********************
 * STATE
 ***********************/
let candidates = [];
let reservations = [];

/***********************
 * SELECTORS
 ***********************/
const container = document.querySelector(".candidates-grid");

/***********************
 * LOAD DATA
 ***********************/
async function loadReservedCandidates() {
  try {
    const [cRes, rRes] = await Promise.all([
      fetch(`${API_URL}/candidates`),
      fetch(`${API_URL}/reservations`)
    ]);

    candidates = await cRes.json();
    reservations = await rRes.json();

    renderReservedCandidates();
  } catch (error) {
    console.error(error);
  }
}

/***********************
 * FILTER LOGIC
 ***********************/
function getReservedCandidates() {
  const myReservations = reservations.filter(
    r =>
      r.active &&
      r.companyId === currentUser.companyId
  );

  return candidates.filter(c =>
    myReservations.some(r => r.candidateId === c.id)
  );
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

  loadReservedCandidates();
}

/***********************
 * RENDER
 ***********************/
function renderReservedCandidates() {
  container.innerHTML = "";

  if (!isLogged || currentUser.role !== "company") {
    container.innerHTML = "<p>No autorizado</p>";
    return;
  }

  const list = getReservedCandidates();

  if (list.length === 0) {
    container.innerHTML = "<p>No tienes candidatos reservados</p>";
    return;
  }

  list.forEach(c => {
    const card = document.createElement("div");
    card.className = "candidate-card";

    card.innerHTML = `
      <h3>${c.fullName}</h3>
      <p>${c.title}</p>
      <p>${c.skills.join(", ")}</p>

      <button class="btn btn-secondary"
        onclick="releaseReservation('${c.id}')">
        Liberar
      </button>
    `;

    container.appendChild(card);
  });
}

/***********************
 * INIT
 ***********************/
document.addEventListener("DOMContentLoaded", loadReservedCandidates);
