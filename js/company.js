import { saveData } from "./../js/utils.js";

saveData();

const outputProfile = document.getElementById('profile');
const outputOffers = document.getElementById('jobs-grid')

function renderProfile(company) {
    const profile = document.createElement('section');
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
      </section>`

    outputProfile.appendChild(profile)

      jobs.forEach(job => {
        const jobOffer = document.createElement('section');
        jobOffer.classList.add('job-card');

        jobOffer.innerHTML = `
            <h3>${job.title}</h3>
            <p>${job.details}</p>`

        outputOffers.appendChild(jobOffer)
      });

      
}

document.addEventListener('DOMContentLoaded', () => {
    const companyInfo = JSON.parse(localStorage.getItem('companyInfo'));
    renderProfile(companyInfo)
}
)