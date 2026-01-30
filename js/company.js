import { saveData } from "./../js/utils.js";

saveData();

const outputProfile = document.getElementById("profile");
const outputOffers = document.getElementById("jobs-grid");

function renderProfile(company) {
  const profile = document.createElement("section");
  profile.classList.add("company");
  const jobs = company.jobs;

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

  jobs.forEach((job) => {
    const jobOffer = document.createElement("section");
    jobOffer.classList.add("job-card");
    const buttons = document.createElement("section");
    const btnEdit = document.createElement("button");
    const btnDelete = document.createElement("button");
    buttons.classList.add("actions");

    jobOffer.innerHTML = `
            <h3>${job.title}</h3>
            <h5>${job.modality}</h5>
            <p>${job.details}</p>`;

    btnEdit.innerHTML = `Edit<img src="./../assets/edit.svg">`;
    btnDelete.innerHTML = `Delete<img src="./../assets/trash.svg">`;

    buttons.appendChild(btnDelete);
    buttons.appendChild(btnEdit);

    jobOffer.appendChild(buttons);

    outputOffers.appendChild(jobOffer);
  });
}

const createBtn = document.getElementById('new-offer');

createBtn.addEventListener('click', () => {
    createOffer()
})

function createOffer() {
  const modal = document.getElementById("createModal");
  modal.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  const companyInfo = JSON.parse(localStorage.getItem("companyInfo"));
  renderProfile(companyInfo);
});
