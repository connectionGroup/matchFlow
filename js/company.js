import {
  fetchCompanies,
  fetchJobOffers,
  saveOffer,
  deleteJobOffer,
  patchOffer,
} from "./storage.js";
import { getCompany, getOffers, currentCompany } from "./utils.js";

const outputProfile = document.getElementById("profile");
const outputOffers = document.getElementById("jobs-grid");

const createBtn = document.getElementById("new-offer");

const modal = document.getElementById("createModal");

const companyObj = currentCompany();
const companyId = companyObj.id;

let currentCardId = null;

document.addEventListener("DOMContentLoaded", async () => {
  let loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"))
  if (loggedUser) {
    if (loggedUser.role !== "company") {
      window.location.replace("./../pages/candidate.html")
    }
  } else {
    window.location.replace("./../pages/login.html")
  }

  const companies = await fetchCompanies();
  const jobOffers = await fetchJobOffers();

  const company = companies.filter((comp) => comp.id === companyId);

  const offers = jobOffers.filter((offer) => offer.companyId === companyId);

  const companyInfo = getCompany(company, companyId);
  const companyOffers = getOffers(offers, companyId);

  renderProfile(companyInfo);
  renderOffers(companyOffers);
});

function renderProfile(company) {
  const profile = document.createElement("section");
  profile.classList.add("company");

  profile.innerHTML = `<section class="company-header">
        <article class="company-info">
          <img class="company-logo" src=${company.logo} alt="">
          <div>
            <h1>${company.name}</h1>
            <p class="company-tagline">
              ${company.catchPhrase}
            </p>
          </div>
        </article>
      </section>

      <section class="card company-description">
        <h2>About the Company</h2>
        <p>
          ${company.description}
        </p>
      </section>`;

  outputProfile.appendChild(profile);
}

function renderOffers(offers) {
  outputOffers.innerHTML = ``
  offers.forEach((job) => {
    const jobOffer = document.createElement("section");
    jobOffer.classList.add("job-card");
    const buttons = document.createElement("section");
    const btnEdit = document.createElement("button");
    const btnDelete = document.createElement("button");
    btnEdit.classList.add("edit-btn");
    btnEdit.type = "button";
    btnDelete.classList.add("delete-btn");
    btnDelete.type = "button";
    buttons.classList.add("actions");

    jobOffer.innerHTML = `
            <h3>${job.title}</h3>
            <section class='job-subtitle'> <h5>${getModalityLabel(job.modality)}</h5><span class="badge rounded-pill text-bg-success">${job.status}</span></section>
            <p>${job.details}</p>`;

    jobOffer.dataset.id = job.id;

    btnEdit.innerHTML = `Edit<img src="./../assets/edit.svg">`;
    btnDelete.innerHTML = `Delete<img src="./../assets/trash.svg">`;

    buttons.appendChild(btnDelete);
    buttons.appendChild(btnEdit);

    jobOffer.appendChild(buttons);

    outputOffers.appendChild(jobOffer);
  });
}

function getModalityLabel(value) {
  const modalityMap = {
    "remote-fulltime": "Remote - Full Time",
    "hybrid-fulltime": "Hybrid - Full Time",
    "site-fulltime": "In Site - Full Time",
    "remote-parttime": "Remote - Part Time",
    "hybrid-parttime": "Hybrid - Part Time",
    "site-parttime": "In Site - Part Time",
    "other": "Other"
  };

  return modalityMap[value] || value;
}

createBtn.addEventListener("click", () => {
  offerModal(false);
});

function setSelectValueAndLock(select, value) {
  select.value = value;

  Array.from(select.options).forEach((option) => {
    option.disabled = option.value !== value;
  });
}

function offerModal(mode, card) {
  modal.style.display = "block";
  setSelectValueAndLock(document.getElementById("job-status"), "open");

  const span = document.getElementsByClassName("close")[0];
  span.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  if (mode) {
    const select = document.getElementById("job-status")
    Array.from(select.options).forEach((option) => {
      option.disabled = false;
    });
    modal.querySelector("h3").innerHTML = "Update Job Offer";
    const jobTitle = document.getElementById("job-title");
    const jobDescription = document.getElementById("job-description");
    const jobModality = document.getElementById("job-modality");
    const oldTitle = card.querySelector("h3").innerHTML;
    const oldDescription = card.querySelector("p").innerHTML.trim();
    const oldModality = card.querySelector("h5").innerHTML;
    jobTitle.value = oldTitle;
    jobDescription.value = oldDescription;
    jobModality.value = oldModality.replace(/ /g, "").toLowerCase();
  }
}

outputOffers.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const deleteBtn = e.target.closest(".delete-btn");
  const editBtn = e.target.closest(".edit-btn");
  const card = e.target.closest(".job-card");
  currentCardId = card.dataset.id;

  if (deleteBtn) {
    await deleteOffer(currentCardId);
  }

  if (editBtn) {
    offerModal(true, card);
  }
});

const form = document.getElementById("create-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const offer = new FormData(form);
  if (modal.querySelector("h3").textContent === "New Job Offer") {
    await createOffer(getInput(offer));
  } else {
    await updateOffer(currentCardId, getInput(offer));
  }
  modal.style.display = "none";
});

function getInput(inputOffer) {
  const offer = { companyId };

  for (const [key, value] of inputOffer) {
    offer[key] = value;
  }

  offer["status"] = "open";
  return offer;
}

async function createOffer(offer) {
  await saveNewOffer(offer);
}

async function saveNewOffer(offer) {
  await saveOffer(offer);
  renderOffers(await getOffers(await fetchJobOffers(), companyId))
}

async function updateOffer(offerId, data) {
  try {
    await patchOffer(offerId, data);
    renderOffers(await getOffers(await fetchJobOffers(), companyId))
  } catch (error) {
    console.error("Error updating offer:", await error);
  }
}

async function deleteOffer(offerId) {
  if (!offerId) return;
  await deleteJobOffer(offerId);
  renderOffers(await getOffers(await fetchJobOffers(), companyId))
}
