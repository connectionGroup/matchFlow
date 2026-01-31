import {
  fetchCompanies,
  fetchJobOffers,
  saveOffer,
  deleteJobOffer,
  patchOffer
} from "./storage.js";
import { getCompany, getOffers, currentCompany } from "./utils.js";

const outputProfile = document.getElementById("profile");
const outputOffers = document.getElementById("jobs-grid");

const createBtn = document.getElementById("new-offer");

const modal = document.getElementById("createModal");

const companyObj = currentCompany();
const companyId = companyObj.id;

let currentCardId = null

document.addEventListener("DOMContentLoaded", async () => {
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
            <h5>${job.modality}</h5>
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

createBtn.addEventListener("click", () => {
  offerModal(false);
});

function offerModal(mode, card) {
  modal.style.display = "block";

  const span = document.getElementsByClassName("close")[0];
  span.addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  if (mode) {
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
  console.log(currentCardId)
  alert('wait')

  if (deleteBtn) {
    await deleteOffer(currentCardId);
  }

  if (editBtn) {
    offerModal(true, card);
  }
});

const form = document.getElementById("create-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const offer = new FormData(form);
  if (modal.querySelector("h3").textContent === "New Job Offer") {
    createOffer(getInput(offer));
  }
  else{
    console.log(currentCardId)
    alert('wait')
    updateOffer(currentCardId,getInput(offer))
  }
  // alert("wait");
  

  modal.style.display = "none";
});

function getInput(inputOffer){
  const offer = { companyId };

  for (const [key, value] of inputOffer) {
    offer[key] = value;
  }

  offer["status"] = "open";
  return offer
}

function createOffer(offer) {
  
  saveNewOffer(offer);
}

async function saveNewOffer(offer) {
  await saveOffer(offer);
}

async function updateOffer(offerId, data) {
  try {
    const result = await patchOffer(offerId, data);
  } catch (error) {
    console.error("Error updating offer:", await error);
  }
}

async function deleteOffer(offerId) {
  if (!offerId) return;
  return await deleteJobOffer(offerId);
}
