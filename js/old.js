import {
  fetchCompanies,
  fetchJobOffers,
  saveOffer,
  patchOffer,
  deleteJobOffer,
} from "./storage.js";
import { getCompany, getOffers } from "./utils.js";

const outputProfile = document.getElementById("profile");
const outputOffers = document.getElementById("jobs-grid");

const createBtn = document.getElementById("new-offer");

const modal = document.getElementById("createModal");

document.addEventListener("DOMContentLoaded", async () => {
  const companies = await fetchCompanies();
  const offers = await fetchJobOffers();

  const companyId = "4401"; // CAMBIARLO LUEGO A SESSION

  const companyInfo = getCompany(companies, companyId);
  const companyOffers = getOffers(offers, companyId);

  renderProfile(companyInfo, companyOffers);
});

function renderProfile(company, offers) {
  const profile = document.createElement("section");
  profile.classList.add("company");

  console.log(company);

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
    console.log(jobOffer.dataset.id);
    btnEdit.innerHTML = `Edit<img src="./../assets/edit.svg">`;
    btnDelete.innerHTML = `Delete<img src="./../assets/trash.svg">`;

    buttons.appendChild(btnDelete);
    buttons.appendChild(btnEdit);

    jobOffer.appendChild(buttons);

    outputOffers.appendChild(jobOffer);
  });
}

createBtn.addEventListener("click", () => {
  createOffer();
});

function createOffer() {
  modal.style.display = "block";
}

outputOffers.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
//   e.preventDefault();
//   e.stopPropagation();
//   console.log("target:", e.target);
//   console.log("card:", e.target.closest(".job-card"));

//   const deleteBtn = e.target.closest(".delete-btn");
//   const editBtn = e.target.closest(".edit-btn");

//   if (!deleteBtn && !editBtn) return;

//   const card = e.target.closest(".job-card");
//   if (!card) return; // Add this safety check
  
//   const offerId = card.dataset.id;
//   console.log(offerId);

//   if (deleteBtn) {
//     await deleteOffer(offerId);
//   }

//   if (editBtn) {
//     await updateOffer(offerId, { status: "open" });
//   }

console.log("Click detected on:", e.target);
  
  const deleteBtn = e.target.closest(".delete-btn");
  const editBtn = e.target.closest(".edit-btn");

  if (!deleteBtn && !editBtn) {
    console.log("Not a button click, returning");
    return;
  }

  // Prevent default BEFORE doing anything else
  

  const card = e.target.closest(".job-card");
  if (!card) return;
  
  const offerId = card.dataset.id;
  console.log("Offer ID:", offerId);

  if (deleteBtn) {
    console.log("Delete button clicked");
    await deleteOffer(offerId);
  }

  if (editBtn) {
    console.log("Edit button clicked - about to update");
    await updateOffer(offerId, { status: "open" });
    console.log("Update completed");
    
  }

});

const form = document.getElementById("create-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  //   const newOffer = new FormData(form);
  const newOffer = {
    id: "3",
    companyId: "1",
    title: "Frontend Developer",
    modality: "Remote - Full Time",
    details:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatem explicabo minus iure, ex praesentium temporibus exercitationem molestiae, repellat debitis sed quas fuga quo ipsa sapiente laboriosam, cumque quos eaque eligendi.",
    status: "open",
  };

  const createdOffer = await saveOffer(newOffer);
  console.log("Creada:", createdOffer);
  //   saveOffer(newOffer);
  modal.style.display = "none";
});

// async function updateOffer(offerId, data) {
//   console.log("entra");
//   await patchOffer(offerId, data);

//   console.log("Oferta actualizada");
// }

async function updateOffer(offerId, data) {
  try {
    console.log("Updating offer:", offerId, data);
    const result = await patchOffer(offerId, data);
    console.log("Update successful:", await result);
  } catch (error) {
    console.error("Error updating offer:", await error);
  }
}

async function deleteOffer(offerId) {
  if (!offerId) return;

  //   const confirmDelete = confirm("¿Seguro que deseas eliminar esta oferta?");
  //   if (!confirmDelete) return;

  return await deleteJobOffer(offerId);
  // console.log("Oferta eliminada");
}
