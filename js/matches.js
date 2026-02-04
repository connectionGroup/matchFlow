import { getData, postData, patchData, deleteData } from "./api.js";

const modalEl = document.getElementById("exampleModal");
const saveMatch = document.getElementById("saveMatch");

let dataLoaded = false;

// Cargar data CUANDO el modal ya está visible
modalEl.addEventListener("shown.bs.modal", loadModalData);

async function loadModalData() {
    // Evita duplicar opciones cada vez que abres el modal
    if (dataLoaded) return;
    dataLoaded = true;

    try {
        const [offerts, candidates] = await Promise.all([
            getData("jobOffers"),
            getData("candidates"),
        ]);

        const listOfferts = document.getElementById("listOfferts");
        const listCandidates = document.getElementById("listCandidates");

        // Limpia por seguridad
        listOfferts.innerHTML = "";
        listCandidates.innerHTML = "";

        // Placeholder
        listOfferts.appendChild(createOption("", "Select an offer"));
        listCandidates.appendChild(createOption("", "Select a candidate"));

        // Ofertas
        offerts.forEach(offert => {
            listOfferts.appendChild(
                createOption(offert.id, offert.title)
            );
        });

        // Candidatos
        candidates.forEach(candidate => {
            listCandidates.appendChild(
                createOption(candidate.id, candidate.fullName)
            );
        });

    } catch (error) {
        console.error("Error loading modal data:", error);
    }
}

// Helper para crear options (limpio y reutilizable)
function createOption(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

// Ejemplo: guardar match
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
            "companyId": 1,
            "jobOfferId": offerId,
            "candidateId": candidateId,
            "status": status
        });

        alert("Match saved ✅");
    } catch (error) {
        console.error("Error saving match:", error);
    }
});


loadMatches();

const tableBody = document.querySelector("#matchesTable tbody");

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
        const offer = offers.find(o => o.id == match.jobOfferId);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${company ? company.name : match.companyId}</td>
          <td>${offer ? offer.title : match.jobOfferId}</td>
          <td>${candidate ? candidate.fullName : match.candidateId}</td>
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
            <button class="btn btn-danger btn-sm delete-btn" data-id="${match.id}">Delete</button>
          </td>
        `;

        tableBody.appendChild(tr);
    });
}


tableBody.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("status-select")) return;

    const matchId = e.target.dataset.id;
    const newStatus = e.target.value;

    await patchData("matches", matchId, {
        status: newStatus,
    });

    // refresca tabla
    loadMatches();
});

tableBody.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;

    const matchId = e.target.dataset.id;

    const confirmDelete = confirm("Delete this match?");
    if (!confirmDelete) return;

    await deleteData("matches", matchId);

    // refresca tabla
    loadMatches();
});
