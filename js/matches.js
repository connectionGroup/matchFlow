import { getData, postData, patchData, deleteData } from "./api.js";

const modalEl = document.getElementById("exampleModal");
const saveMatch = document.getElementById("saveMatch");
const tableBody = document.querySelector("#matchesTable tbody");

let dataLoaded = false;

/***********************
 * MODAL LOAD
 ***********************/
modalEl.addEventListener("shown.bs.modal", loadModalData);

async function loadModalData() {
  if (dataLoaded) return;
  dataLoaded = true;

  try {
    const [offerts, candidates] = await Promise.all([
      getData("jobOffers"),
      getData("candidates"),
    ]);

    const listOfferts = document.getElementById("listOfferts");
    const listCandidates = document.getElementById("listCandidates");

    listOfferts.innerHTML = "";
    listCandidates.innerHTML = "";

    listOfferts.appendChild(createOption("", "Select an offer"));
    listCandidates.appendChild(createOption("", "Select a candidate"));

    offerts.forEach(offert => {
      listOfferts.appendChild(createOption(offert.id, offert.title));
    });

    candidates.forEach(candidate => {
      listCandidates.appendChild(createOption(candidate.id, candidate.fullName));
    });

    // auto-select candidate from button Match
    const savedCandidateId = localStorage.getItem("selectedCandidateId");
    if (savedCandidateId) {
      listCandidates.value = savedCandidateId;
    }

  } catch (error) {
    console.error("Error loading modal data:", error);
  }
}

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

/***********************
 * SAVE MATCH
 ***********************/
saveMatch.addEventListener("click", async () => {
  const offerId = document.getElementById("listOfferts").value;
  const candidateId = document.getElementById("listCandidates").value;
  const status = document.getElementById("status").value;

  if (!offerId || !candidateId || !status) {
    alert("Select offer, candidate and status");
    return;
  }

  try {
    await postData("matches", {
      companyId: "4401",
      jobOfferId: offerId,
      candidateId: candidateId,
      status: status
    });

    localStorage.removeItem("selectedCandidateId");
    loadMatches();
    alert("Match saved ✅");

  } catch (error) {
    console.error("Error saving match:", error);
  }
});

/***********************
 * LOAD TABLE
 ***********************/
async function loadMatches() {
  const [matches, candidates, companies, offers] = await Promise.all([
    getData("matches"),
    getData("candidates"),
    getData("companies"),
    getData("jobOffers"),
  ]);

  renderMatches(matches, candidates, companies, offers);
}

function renderMatches(matches, candidates, companies, offers) {
  tableBody.innerHTML = "";

  matches.forEach(match => {
    const candidate = candidates.find(c => c.id == match.candidateId);
    const company = companies.find(c => c.id == match.companyId);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${company ? company.name : match.companyId}</td>
      <td>${match.jobOfferId}</td>
      <td>${candidate ? `${candidate.fullName} — ${candidate.title}`: match.candidateId}</td>
      <td>
        <select class="form-select form-select-sm status-select" data-id="${match.id}">
          <option value="pending" ${match.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="contacted" ${match.status === "contacted" ? "selected" : ""}>Contacted</option>
          <option value="interview" ${match.status === "interview" ? "selected" : ""}>Interview</option>
          <option value="hired" ${match.status === "hired" ? "selected" : ""}>Hired</option>
          <option value="discarded" ${match.status === "discarded" ? "selected" : ""}>Discarded</option>
        </select>
      </td>
      <td>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${match.id}">
          Delete
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

/***********************
 * EVENTS
 ***********************/
tableBody.addEventListener("change", async e => {
  if (!e.target.classList.contains("status-select")) return;

  await patchData("matches", e.target.dataset.id, {
    status: e.target.value
  });

  loadMatches();
});

tableBody.addEventListener("click", async e => {
  if (!e.target.classList.contains("delete-btn")) return;

  if (!confirm("Delete this match?")) return;

  await deleteData("matches", e.target.dataset.id);
  loadMatches();
});

/***********************
 * INIT
 ***********************/
loadMatches();
