/**
 * @file Lógica para la página de perfil de la empresa.
 * @description Maneja la renderización del perfil, la creación, visualización,
 * edición y eliminación de ofertas de trabajo.
 */
import { protectPage, getCurrentUser } from './auth.js';
import { getData, postData, patchData, deleteData } from './api.js';

// Solo "company" puede acceder
protectPage(["company"]);

document.addEventListener("DOMContentLoaded", async () => {
  // Obtenemos el usuario y los elementos del DOM aquí para asegurar que todo está cargado
  // y que la protección de la página ha tenido la oportunidad de redirigir si es necesario.
  const user = getCurrentUser();

  // --- ROBUSTNESS CHECK ---
  // Si el usuario no existe o no tiene un ID de empresa, detenemos la ejecución.
  // Esto previene errores si la redirección de `protectPage` falla o si los datos son inconsistentes.
  if (!user || !user.companyId) {
    console.error("Authentication Error: User is not a valid company or is not logged in.");
    document.body.innerHTML = `<div class="container alert alert-danger mt-5">Error de autenticación. No se pudo cargar el perfil de la empresa.</div>`;
    return;
  }

  let currentCardId = null;

  const companyId = user.companyId;
  const outputProfile = document.getElementById("profile");
  const outputOffers = document.getElementById("jobs-grid");
  const createBtn = document.getElementById("new-offer");
  const modal = document.getElementById("createModal");
  const form = document.getElementById("create-form");

  const [allCompanies, allJobOffers] = await Promise.all([
    getData('companies'),
    getData('jobOffers')
  ]);

  const company = allCompanies.find((comp) => comp.id === companyId);
  if (!company) {
    console.error(`Data Inconsistency: Company profile with ID "${companyId}" not found for user "${user.email}".`);
    outputProfile.innerHTML = `<div class="alert alert-danger">Error de datos: No se encontró el perfil de la empresa asociado a su cuenta.</div>`;
    return;
  }

  const companyOffers = allJobOffers.filter((offer) => offer.companyId === companyId);

  // Load Candidate Applications
  async function loadCandidateApplications(companyId) {
    const applicationsContainer = document.getElementById('applications-container');
    const applicationsCount = document.getElementById('applications-count');

    if (!applicationsContainer || !applicationsCount) {
      console.error('Applications container elements not found');
      return;
    }

    try {
      const matches = await getData('matches');
      const applications = matches.filter(m => m.companyId === companyId && m.initiatedBy === 'candidate');

      applicationsCount.textContent = applications.length;

      if (applications.length === 0) {
        applicationsContainer.innerHTML = `
          <div class="col-12 text-center py-4 text-muted">
            <i class="bi bi-inbox" style="font-size: 3rem;"></i>
            <p class="mt-3">No applications received yet</p>
            <p class="small">Candidates who apply to your job offers will appear here</p>
          </div>
        `;
        return;
      }

      // Fetch candidate and job offer details
      const applicationsWithDetails = await Promise.all(
        applications.map(async (app) => {
          try {
            const candidate = await getData(`candidates/${app.candidateId}`);
            const jobOffer = await getData(`jobOffers/${app.jobOfferId}`);
            return { ...app, candidate, jobOffer };
          } catch (error) {
            console.error('Error loading application details:', error);
            return null;
          }
        })
      );

      const validApplications = applicationsWithDetails.filter(a => a && a.candidate && a.jobOffer);

      if (validApplications.length === 0) {
        applicationsContainer.innerHTML = `
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle"></i> Error loading application details
          </div>
        `;
        return;
      }

      // Store applications globally for easy access
      window.currentApplications = validApplications;

      const statusLabels = {
        pending: { text: 'New Application', color: 'primary', icon: 'envelope-check' },
        contacted: { text: 'Contacted', color: 'info', icon: 'telephone' },
        interview: { text: 'Interview Scheduled', color: 'warning', icon: 'calendar-check' },
        hired: { text: 'Hired', color: 'success', icon: 'trophy' },
        discarded: { text: 'Rejected', color: 'secondary', icon: 'x-circle' }
      };

      applicationsContainer.innerHTML = validApplications.map(app => {
        const status = statusLabels[app.status] || statusLabels.pending;
        const createdDate = new Date(app.createdAt).toLocaleDateString();
        const candidate = app.candidate;

        return `
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="mb-1">
                    <i class="bi bi-person-circle text-primary"></i> ${candidate.fullName}
                  </h5>
                  <p class="text-muted small mb-0">${candidate.title || 'No title specified'}</p>
                </div>
                <span class="badge bg-${status.color}">
                  <i class="bi bi-${status.icon}"></i> ${status.text}
                </span>
              </div>

              <div class="mb-2">
                <strong class="text-primary">
                  <i class="bi bi-briefcase"></i> Applied for:
                </strong> ${app.jobOffer.title}
              </div>

              ${candidate.skills && candidate.skills.length > 0 ? `
                <div class="mb-2">
                  <strong>Skills:</strong>
                  <div class="d-flex flex-wrap gap-1 mt-1">
                    ${candidate.skills.slice(0, 5).map(skill => 
                      `<span class="badge bg-secondary">${skill}</span>`
                    ).join('')}
                  </div>
                </div>
              ` : ''}

              ${candidate.experience ? `
                <div class="mb-2">
                  <strong>Experience:</strong> ${candidate.experience}
                </div>
              ` : ''}

              <div class="text-muted small mb-3">
                <i class="bi bi-calendar"></i> Applied: ${createdDate}
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-primary" 
                        onclick="viewApplicationDetails('${app.id}')">
                  <i class="bi bi-eye"></i> View Profile
                </button>
                <a href="matches.html" class="btn btn-sm btn-success">
                  <i class="bi bi-heart-fill"></i> Manage in Pipeline
                </a>
                ${candidate.contact?.phone ? `
                  <a href="tel:${candidate.contact.phone}" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-telephone"></i> Call
                  </a>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      console.error('Error loading applications:', error);
      applicationsContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> Error loading applications. Please try again.
        </div>
      `;
    }
  }

  renderProfile(company);
  renderOffers(companyOffers);
  loadCandidateApplications(companyId);

  function renderProfile(company) {
    // Se limpia el contenedor y se inserta el HTML del perfil.
    // Esto es más eficiente y simple que crear y añadir elementos.
    outputProfile.innerHTML = `
      <section class="company-header">
        <article class="company-info">
          <img class="company-logo" src="${company.logo}" alt="Logo de ${company.name}">
          <div>
            <h1>${company.name}</h1>
            <p class="company-tagline">${company.catchPhrase}</p>
          </div>
        </article>
      </section>
      <section class="card company-description">
        <h2>About the Company</h2>
        <p>${company.description}</p>
      </section>
    `;
  }

  function renderOffers(offers) {
    outputOffers.innerHTML = ``;
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

  function getInput(inputOffer) {
    const offer = { companyId };

    for (const [key, value] of inputOffer) {
      offer[key] = value;
    }

    return offer;
  }

  async function createOffer(offer) {
    Swal.fire({
        title: 'Creating Job Offer...',
        html: `
            <div class="text-center">
                <div class="spinner-border text-success mb-3" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mb-2">Publishing your job offer</p>
                <div class="progress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                         role="progressbar" 
                         style="width: 100%">
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    await postData('jobOffers', offer);
    const updatedOffers = await getData(`jobOffers?companyId=${companyId}`);
    renderOffers(updatedOffers);

    await Swal.fire({
        title: 'Job Offer Created Successfully!',
        html: `
            <div class="text-center">
                <i class="bi bi-briefcase-fill text-success" style="font-size: 4rem;"></i>
                <h4 class="mt-3">Offer Details</h4>
                
                <div class="alert alert-success text-start mt-4">
                    <h6 class="mb-3"><i class="bi bi-check-circle-fill"></i> <strong>Published</strong></h6>
                    <p class="mb-2"><strong>${offer.title}</strong></p>
                    <p class="mb-1 text-muted small"><i class="bi bi-geo-alt-fill"></i> ${offer.modality}</p>
                    <p class="mb-0 text-muted small"><i class="bi bi-info-circle"></i> Status: ${offer.status.toUpperCase()}</p>
                </div>
                
                <p class="text-muted">Candidates can now see and apply to this position</p>
            </div>
        `,
        icon: 'success',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Great!'
    });
  }

  async function updateOffer(offerId, data) {
    try {
      Swal.fire({
          title: 'Updating Job Offer...',
          html: `
              <div class="text-center">
                  <div class="spinner-border text-primary mb-3" role="status" style="width: 2.5rem; height: 2.5rem;">
                      <span class="visually-hidden">Loading...</span>
                  </div>
                  <p>Saving changes...</p>
              </div>
          `,
          showConfirmButton: false,
          allowOutsideClick: false
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      await patchData(`jobOffers/${offerId}`, data);
      const updatedOffers = await getData(`jobOffers?companyId=${companyId}`);
      renderOffers(updatedOffers);

      await Swal.fire({
          title: 'Updated!',
          text: 'Job offer updated successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
      });
    } catch (error) {
      console.error("Error updating offer:", await error);
      Swal.fire('Error', 'Could not update job offer', 'error');
    }
  }

  async function deleteOffer(offerId) {
    if (!offerId) return

    const result = await Swal.fire({
        title: 'Delete Job Offer?',
        text: 'This action cannot be undone',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: 'Deleting...',
        html: `
            <div class="text-center">
                <div class="spinner-border text-danger mb-3" role="status" style="width: 2.5rem; height: 2.5rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Removing job offer...</p>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await deleteData(`jobOffers/${offerId}`);
    const updatedOffers = await getData(`jobOffers?companyId=${companyId}`);
    renderOffers(updatedOffers);

    await Swal.fire({
        title: 'Deleted!',
        text: 'Job offer has been removed',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
  }

  // --- Event Listeners ---
  createBtn.addEventListener("click", () => {
    offerModal(false);
  });

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

  // View Application Details - Global function
  window.viewApplicationDetails = (matchId) => {
    // Find the application data from the global store
    const app = window.currentApplications?.find(a => a.id == matchId);
    
    if (!app) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Application not found'
      });
      return;
    }

    const candidate = app.candidate;
    const jobOffer = app.jobOffer;
    
    Swal.fire({
      title: 'Candidate Profile',
      html: `
        <div class="text-start">
          <div class="alert alert-primary">
            <h5><i class="bi bi-person-badge"></i> ${candidate.fullName}</h5>
            <p class="mb-0">${candidate.title || 'No title specified'}</p>
          </div>
          
          <div class="alert alert-success">
            <strong><i class="bi bi-briefcase"></i> Applied for:</strong> ${jobOffer.title}
          </div>

          ${candidate.experience ? `
            <div class="mb-2">
              <strong>Experience:</strong> ${candidate.experience}
            </div>
          ` : ''}

          ${candidate.skills && candidate.skills.length > 0 ? `
            <div class="mb-3">
              <strong>Skills:</strong>
              <div class="d-flex flex-wrap gap-1 mt-2">
                ${candidate.skills.map(skill => `<span class="badge bg-secondary">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${candidate.contact?.phone ? `
            <div class="alert alert-info">
              <strong><i class="bi bi-telephone"></i> Phone:</strong> ${candidate.contact.phone}
              ${candidate.contact.whatsapp ? `<br><a href="${candidate.contact.whatsapp}" target="_blank" class="btn btn-success btn-sm mt-2"><i class="bi bi-whatsapp"></i> Contact via WhatsApp</a>` : ''}
            </div>
          ` : ''}

          <div class="alert alert-warning">
            <i class="bi bi-info-circle"></i> <strong>Tip:</strong> Review this candidate in your <a href="matches.html">Matches Pipeline</a> to manage the hiring process.
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close',
      confirmButtonColor: '#667eea',
      width: '600px'
    });
  };
});