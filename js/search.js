//  * CONFIG
const API_URL = "http://localhost:3001";

//  * SESSION (MOCK LOGIN)
const isLogged = true;

const currentUser = {
  role: "company",
  companyId: "4401"
};

// Job offer seleccionada (simulada)
const currentJobOfferId = "e829";

//  * STATE
let candidates = [];
let reservations = [];

//  * LOAD DATA
async function loadData() {
  try {
    const cRes = await fetch(`${API_URL}/candidates`);
    candidates = await cRes.json();

    const rRes = await fetch(`${API_URL}/reservations`);
    reservations = await rRes.json();

    renderCandidates(searchCandidates(""));
  } catch (err) {
    console.error("Error loading data", err);
  }
}

//  * RESERVATION LOGIC
function isCandidateReserved(candidateId) {
  return reservations.some(
    r => r.active === true && r.candidateId === candidateId
  );
}

//  * VISIBILITY RULES
function canSeeCandidate(candidate) {
  if (!isLogged) return false;
  if (currentUser.role !== "company") return false;
  if (!candidate.openToWork) return false;
  if (isCandidateReserved(candidate.id)) return false;

  return true;
}

//  * SEARCH
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

//  * RESERVE CANDIDATE
async function reserveCandidate(candidateId) {
  if (isCandidateReserved(candidateId)) {
    alert("Candidate already reserved");
    return;
  }

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

//  * RELEASE RESERVATION
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

//  * RENDER
function renderCandidates(list) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!isLogged) {
    container.innerHTML = "<p>You must be logged in</p>";
    return;
  }

  if (currentUser.role !== "company") {
    container.innerHTML = "<p>Only companies can search candidates</p>";
    return;
  }

  if (list.length === 0) {
    container.innerHTML = "<p>No available candidates</p>";
    return;
  }

  list.forEach(c => {
    const div = document.createElement("div");
    div.className = "candidate-card";

    div.innerHTML = `
      <h3>${c.fullName}</h3>
      <p><strong>${c.title}</strong></p>
      <p>Experience: ${c.experience}</p>
      <p>Skills: ${c.skills.join(", ")}</p>
      <button onclick="reserveCandidate('${c.id}')">Reserve</button>
    `;

    container.appendChild(div);
  });
}

//  * EVENTS
document.getElementById("searchInput").addEventListener("input", e => {
  renderCandidates(searchCandidates(e.target.value));
});

//  * INIT
loadData();
