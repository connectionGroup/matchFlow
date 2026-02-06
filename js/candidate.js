import { protectPage, getCurrentUser } from './auth.js';
import { getData, patchData, postData } from './api.js';

protectPage(['candidate']);
const user = getCurrentUser();

const profileContainer = document.getElementById('profile-container');

async function loadProfile() {
    if (!user || !user.candidateId) {
        profileContainer.innerHTML = '<p class="alert alert-danger">Could not load profile.</p>';
        return;
    }

    try {
        const candidate = await getData(`candidates/${user.candidateId}`);
        if (!candidate) {
            console.error(`Data Inconsistency: Candidate profile with ID "${user.candidateId}" not found for user "${user.email}".`);
            profileContainer.innerHTML = '<p class="alert alert-danger">Error: Could not find candidate profile associated with your account.</p>';
            return;
        }
        renderProfile(candidate);
    } catch (error) {
        console.error('Error loading profile:', error);
        profileContainer.innerHTML = '<p class="alert alert-danger">Error loading profile. Please try again.</p>';
    }
}

function renderProfile(candidate) {
    const planLabels = {
        free: { name: 'Free', color: 'secondary', icon: 'gift', reservations: 1 },
        pro1: { name: 'Pro Level 1', color: 'info', icon: 'award', reservations: 2 },
        pro2: { name: 'Pro Level 2', color: 'warning', icon: 'trophy-fill', reservations: 5 }
    };

    const currentPlan = planLabels[candidate.plan || 'free'];

    profileContainer.innerHTML = `
        <div class="profile-header">
            <div>
                <h1 class="profile-name">
                    <i class="bi bi-person-badge-fill"></i> ${candidate.fullName || 'No name set'}
                </h1>
                <p class="profile-title">${candidate.title || 'No title specified'}</p>
            </div>
            <div class="text-end">
                <span class="badge bg-${currentPlan.color} fs-6">
                    <i class="bi bi-${currentPlan.icon}"></i> ${currentPlan.name}
                </span>
            </div>
        </div>

        <form id="profile-form">
            <div class="mb-4">
                <h5 class="mb-3"><i class="bi bi-person-fill text-primary"></i> Personal Information</h5>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="fullName" class="form-label">Full Name *</label>
                        <input type="text" class="form-control" id="fullName" name="fullName" 
                               value="${candidate.fullName || ''}" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="title" class="form-label">Professional Title *</label>
                        <input type="text" class="form-control" id="title" name="title" 
                               value="${candidate.title || ''}" 
                               placeholder="e.g. Frontend Developer" required>
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <h5 class="mb-3"><i class="bi bi-code-slash text-primary"></i> Skills</h5>
                <label class="form-label">Add your skills</label>
                <div class="input-group mb-2">
                    <input type="text" class="form-control" id="skill-input" 
                           placeholder="Type a skill and press Enter">
                    <button class="btn btn-outline-primary" type="button" id="add-skill-btn">
                        <i class="bi bi-plus-circle"></i> Add
                    </button>
                </div>
                <div class="skills-input-container" id="skills-display">
                    ${(candidate.skills || []).map(skill => `
                        <span class="skill-tag">
                            ${skill}
                            <button type="button" onclick="removeSkill('${skill}')">&times;</button>
                        </span>
                    `).join('')}
                </div>
            </div>

            <div class="mb-4">
                <h5 class="mb-3"><i class="bi bi-briefcase-fill text-primary"></i> Experience</h5>
                <label for="experience" class="form-label">Years of Experience</label>
                <input type="text" class="form-control" id="experience" name="experience" 
                       value="${candidate.experience || ''}" 
                       placeholder="e.g. 2 years, 5+ years">
            </div>

            <div class="mb-4">
                <h5 class="mb-3"><i class="bi bi-telephone-fill text-primary"></i> Contact Information</h5>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="phone" class="form-label">Phone Number</label>
                        <input type="tel" class="form-control" id="phone" name="phone" 
                               value="${candidate.contact?.phone || ''}" 
                               placeholder="+57 300 123 4567">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="whatsapp" class="form-label">WhatsApp Link</label>
                        <input type="url" class="form-control" id="whatsapp" name="whatsapp" 
                               value="${candidate.contact?.whatsapp || ''}" 
                               placeholder="https://wa.me/573001234567">
                    </div>
                </div>
            </div>

            <div class="mb-4">
                <h5 class="mb-3"><i class="bi bi-toggle-on text-primary"></i> Availability Status</h5>
                <div class="d-flex align-items-center gap-3">
                    <label class="switch">
                        <input type="checkbox" id="openToWorkToggle" ${candidate.openToWork ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <div>
                        <strong>Open to Work</strong>
                        <p class="text-muted small mb-0">
                            ${candidate.openToWork ? 'Active - Companies can see your profile' : 'Inactive - Your profile is hidden'}
                        </p>
                    </div>
                </div>
            </div>

            <div class="action-buttons">
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-check-circle"></i> Save Changes
                </button>
                <a href="plans.html" class="btn btn-outline-primary">
                    <i class="bi bi-arrow-up-circle"></i> Upgrade Plan
                </a>
                <button type="button" class="btn btn-outline-secondary" onclick="location.reload()">
                    <i class="bi bi-x-circle"></i> Cancel
                </button>
            </div>
        </form>
    `;

    window.currentSkills = [...(candidate.skills || [])];

    const form = document.getElementById('profile-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProfile(candidate.id);
    });

    const skillInput = document.getElementById('skill-input');
    const addSkillBtn = document.getElementById('add-skill-btn');
    
    addSkillBtn.addEventListener('click', () => addSkill(skillInput.value.trim()));
    
    skillInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(skillInput.value.trim());
        }
    });

    const toggle = document.getElementById('openToWorkToggle');
    if (toggle) {
        toggle.addEventListener('change', async (e) => {
            await toggleOpenToWork(candidate.id, e.target.checked);
        });
    }
}

async function toggleOpenToWork(candidateId, newStatus) {
    try {
        Swal.fire({
            title: 'Updating Status...',
            html: `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-2" role="status" style="width: 2.5rem; height: 2.5rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Changing your availability status...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        await patchData(`candidates`, candidateId, { openToWork: newStatus });
        
        await Swal.fire({
            title: 'Status Updated!',
            html: `
                <div class="text-center">
                    <i class="bi bi-${newStatus ? 'toggle-on' : 'toggle-off'} text-${newStatus ? 'success' : 'secondary'}" style="font-size: 3.5rem;"></i>
                    <h4 class="mt-3">Open to Work is now ${newStatus ? 'Active' : 'Inactive'}</h4>
                    <p class="text-muted">${newStatus ? 'Companies can now see your profile' : 'Your profile is hidden from companies'}</p>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#667eea',
            timer: 2000,
            showConfirmButton: false
        });

        loadProfile();
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Could not update status. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
}

// Skill Management
window.addSkill = (skill) => {
    if (!skill) return;
    
    if (window.currentSkills.includes(skill)) {
        Swal.fire({
            title: 'Duplicate Skill',
            text: 'This skill is already added',
            icon: 'warning',
            confirmButtonColor: '#667eea',
            timer: 2000
        });
        return;
    }
    
    window.currentSkills.push(skill);
    document.getElementById('skill-input').value = '';
    
    const skillsDisplay = document.getElementById('skills-display');
    const skillTag = document.createElement('span');
    skillTag.className = 'skill-tag';
    skillTag.innerHTML = `
        ${skill}
        <button type="button" onclick="removeSkill('${skill}')">&times;</button>
    `;
    skillsDisplay.appendChild(skillTag);
};

window.removeSkill = (skill) => {
    window.currentSkills = window.currentSkills.filter(s => s !== skill);
    const skillsDisplay = document.getElementById('skills-display');
    const skillTags = skillsDisplay.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        if (tag.textContent.trim().startsWith(skill)) {
            tag.remove();
        }
    });
};

// Save Profile
async function saveProfile(candidateId) {
    const form = document.getElementById('profile-form');
    const formData = new FormData(form);
    
    const updatedData = {
        fullName: formData.get('fullName'),
        title: formData.get('title'),
        skills: window.currentSkills,
        experience: formData.get('experience'),
        contact: {
            phone: formData.get('phone'),
            whatsapp: formData.get('whatsapp')
        },
        openToWork: document.getElementById('openToWorkToggle').checked
    };

    try {
        Swal.fire({
            title: 'Saving Profile...',
            html: `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-2" role="status" style="width: 2.5rem; height: 2.5rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Updating your profile information...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });

        await new Promise(resolve => setTimeout(resolve, 1200));

        await patchData('candidates', candidateId, updatedData);

        await Swal.fire({
            title: 'Profile Updated!',
            html: `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 3.5rem;"></i>
                    <h4 class="mt-3">Your profile has been saved successfully</h4>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#667eea',
            timer: 2000,
            showConfirmButton: false
        });

        loadProfile();
    } catch (error) {
        console.error('Error saving profile:', error);
        Swal.fire({
            title: 'Error',
            text: 'Could not save profile. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
}

// Load Match Invitations
async function loadInvitations() {
    const invitationsContainer = document.getElementById('invitations-container');
    const invitationsCount = document.getElementById('invitations-count');

    try {
        const matches = await getData('matches');
        const myMatches = matches.filter(m => m.candidateId === user.candidateId);

        invitationsCount.textContent = myMatches.length;
        document.getElementById('apps-badge').textContent = myMatches.length;

        if (myMatches.length === 0) {
            invitationsContainer.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-3">No match invitations yet</p>
                    <p class="small">Companies will appear here when they express interest in your profile</p>
                </div>
            `;
            return;
        }

        // Fetch company and job offer details for each match
        const matchesWithDetails = await Promise.all(
            myMatches.map(async (match) => {
                try {
                    const company = await getData(`companies/${match.companyId}`);
                    const jobOffer = await getData(`jobOffers/${match.jobOfferId}`);
                    return { ...match, company, jobOffer };
                } catch (error) {
                    console.error('Error loading match details:', error);
                    return null;
                }
            })
        );

        const validMatches = matchesWithDetails.filter(m => m && m.company && m.jobOffer);

        if (validMatches.length === 0) {
            invitationsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> Error loading match details
                </div>
            `;
            return;
        }

        const statusLabels = {
            pending: { text: 'New Invitation', color: 'primary', icon: 'envelope-heart' },
            contacted: { text: 'Contacted', color: 'info', icon: 'telephone' },
            interview: { text: 'Interview Scheduled', color: 'warning', icon: 'calendar-check' },
            hired: { text: 'Hired', color: 'success', icon: 'trophy' },
            discarded: { text: 'Not Selected', color: 'secondary', icon: 'x-circle' }
        };

        invitationsContainer.innerHTML = validMatches.map(match => {
            const status = statusLabels[match.status] || statusLabels.pending;
            const createdDate = new Date(match.createdAt).toLocaleDateString();

            return `
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="d-flex align-items-center mb-2">
                                    <img src="${match.company.logo}" alt="${match.company.name}" 
                                         style="width: 48px; height: 48px; object-fit: contain; margin-right: 1rem;">
                                    <div>
                                        <h5 class="mb-0">${match.company.name}</h5>
                                        <p class="text-muted small mb-0">${match.company.industry || 'Technology'}</p>
                                    </div>
                                </div>
                                <h6 class="text-primary mt-3">
                                    <i class="bi bi-briefcase"></i> ${match.jobOffer.title}
                                </h6>
                                <p class="text-muted small mb-2">
                                    <i class="bi bi-geo-alt"></i> ${match.jobOffer.modality}
                                </p>
                                <p class="mb-0">${match.jobOffer.details.substring(0, 150)}...</p>
                            </div>
                            <div class="col-md-4 text-end">
                                <span class="badge bg-${status.color} mb-2">
                                    <i class="bi bi-${status.icon}"></i> ${status.text}
                                </span>
                                <p class="text-muted small mb-2">
                                    <i class="bi bi-calendar"></i> ${createdDate}
                                </p>
                                <button class="btn btn-sm btn-outline-primary w-100 mt-2" 
                                        onclick="viewMatchDetails('${match.id}', '${match.company.name}', '${match.jobOffer.title}', '${match.jobOffer.modality}', \`${match.jobOffer.details}\`, '${status.text}')">
                                    <i class="bi bi-eye"></i> View Details
                                </button>
                                ${match.company.email ? `
                                    <a href="mailto:${match.company.email}" class="btn btn-sm btn-success w-100 mt-2">
                                        <i class="bi bi-envelope"></i> Contact Company
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading invitations:', error);
        invitationsContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> Error loading invitations. Please try again.
            </div>
        `;
    }
}

// Load Available Job Offers
async function loadJobOffers() {
    const offersContainer = document.getElementById('offers-container');
    const offersCount = document.getElementById('offers-count');

    try {
        const jobOffers = await getData('jobOffers');
        const openOffers = jobOffers.filter(offer => offer.status === 'open');

        offersCount.textContent = openOffers.length;
        document.getElementById('jobs-badge').textContent = openOffers.length;

        if (openOffers.length === 0) {
            offersContainer.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-briefcase" style="font-size: 3rem;"></i>
                    <p class="mt-3">No job offers available at the moment</p>
                    <p class="small">Check back soon for new opportunities</p>
                </div>
            `;
            return;
        }

        // Fetch company details for each offer
        const offersWithCompany = await Promise.all(
            openOffers.map(async (offer) => {
                try {
                    const company = await getData(`companies/${offer.companyId}`);
                    return { ...offer, company };
                } catch (error) {
                    console.error('Error loading company details:', error);
                    return null;
                }
            })
        );

        const validOffers = offersWithCompany.filter(o => o && o.company);

        if (validOffers.length === 0) {
            offersContainer.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> Error loading job offers
                </div>
            `;
            return;
        }

        offersContainer.innerHTML = `
            <div class="row">
                ${validOffers.map(offer => `
                    <div class="col-md-6 mb-3">
                        <div class="card h-100 border-0 shadow-sm hover-card" style="transition: transform 0.2s;">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-3">
                                    <img src="${offer.company.logo}" alt="${offer.company.name}" 
                                         style="width: 40px; height: 40px; object-fit: contain; margin-right: 0.75rem;">
                                    <div>
                                        <h6 class="mb-0">${offer.company.name}</h6>
                                        <p class="text-muted small mb-0">${offer.company.industry || 'Technology'}</p>
                                    </div>
                                </div>
                                <h5 class="text-primary mb-2">${offer.title}</h5>
                                <p class="text-muted small mb-2">
                                    <i class="bi bi-geo-alt"></i> ${offer.modality}
                                </p>
                                <p class="card-text small">${offer.details.substring(0, 120)}...</p>
                                <div class="d-grid gap-2">
                                    <button class="btn btn-primary btn-sm" 
                                            onclick="applyToJob('${offer.id}', '${offer.companyId}', '${offer.company.name}', '${offer.title}', '${offer.modality}', \`${offer.details}\`)">
                                        <i class="bi bi-send-fill"></i> Apply Now
                                    </button>
                                    <button class="btn btn-outline-info btn-sm" 
                                            onclick="viewOfferDetails('${offer.id}', '${offer.company.name}', '${offer.title}', '${offer.modality}', \`${offer.details}\`)">
                                        <i class="bi bi-eye"></i> View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add hover effect
        document.querySelectorAll('.hover-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

    } catch (error) {
        console.error('Error loading job offers:', error);
        offersContainer.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> Error loading job offers. Please try again.
            </div>
        `;
    }
}

// View Match Details
window.viewMatchDetails = (matchId, companyName, jobTitle, modality, details, status) => {
    Swal.fire({
        title: 'Match Invitation Details',
        html: `
            <div class="text-start">
                <div class="alert alert-primary">
                    <h5><i class="bi bi-building"></i> ${companyName}</h5>
                </div>
                <div class="alert alert-success">
                    <h6><i class="bi bi-briefcase"></i> ${jobTitle}</h6>
                    <p class="mb-0 small"><i class="bi bi-geo-alt"></i> ${modality}</p>
                </div>
                <div class="alert alert-info">
                    <strong>Status:</strong> ${status}
                </div>
                <h6 class="mt-3">Job Description:</h6>
                <p class="small text-muted">${details}</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Close',
        confirmButtonColor: '#667eea',
        width: '600px'
    });
};

// View Offer Details
window.viewOfferDetails = (offerId, companyName, jobTitle, modality, details) => {
    Swal.fire({
        title: 'Job Offer Details',
        html: `
            <div class="text-start">
                <div class="alert alert-primary">
                    <h5><i class="bi bi-building"></i> ${companyName}</h5>
                </div>
                <div class="alert alert-success">
                    <h6><i class="bi bi-briefcase"></i> ${jobTitle}</h6>
                    <p class="mb-0 small"><i class="bi bi-geo-alt"></i> ${modality}</p>
                </div>
                <h6 class="mt-3">Description:</h6>
                <p class="small text-muted">${details}</p>
                <div class="alert alert-warning mt-3">
                    <i class="bi bi-info-circle"></i> <strong>Note:</strong> Click "Apply Now" to send your application to this company.
                </div>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Close',
        confirmButtonColor: '#667eea',
        width: '600px'
    });
};

// Apply to Job Offer
window.applyToJob = async (jobOfferId, companyId, companyName, jobTitle, modality, details) => {
    // Check if already applied
    try {
        const matches = await getData('matches');
        const alreadyApplied = matches.some(m => 
            m.candidateId === user.candidateId && 
            m.jobOfferId === jobOfferId
        );

        if (alreadyApplied) {
            await Swal.fire({
                title: 'Already Applied',
                text: 'You have already applied to this job offer. Check your Match Invitations section for updates.',
                icon: 'info',
                confirmButtonColor: '#667eea'
            });
            return;
        }

        // Confirm application
        const confirm = await Swal.fire({
            title: 'Apply to Job Offer',
            html: `
                <div class="text-start">
                    <div class="alert alert-primary">
                        <h6><i class="bi bi-building"></i> ${companyName}</h6>
                    </div>
                    <div class="alert alert-success">
                        <h6><i class="bi bi-briefcase"></i> ${jobTitle}</h6>
                        <p class="mb-0 small"><i class="bi bi-geo-alt"></i> ${modality}</p>
                    </div>
                    <p class="small text-muted">${details.substring(0, 200)}...</p>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> Your profile will be sent to the company and they will be able to contact you.
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="bi bi-send-fill"></i> Yes, Apply',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#6c757d',
            width: '600px'
        });

        if (!confirm.isConfirmed) return;

        // Show loading
        Swal.fire({
            title: 'Sending Application...',
            html: `
                <div class="text-center">
                    <div class="spinner-border text-primary mb-2" role="status" style="width: 2.5rem; height: 2.5rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Processing your application...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create match (application)
        const newMatch = {
            companyId: companyId,
            jobOfferId: jobOfferId,
            candidateId: user.candidateId,
            status: 'pending',
            initiatedBy: 'candidate',
            createdAt: new Date().toISOString()
        };

        await postData('matches', newMatch);

        await Swal.fire({
            title: 'Application Sent!',
            html: `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 3.5rem;"></i>
                    <div class="alert alert-success mt-3 text-start">
                        <h6><i class="bi bi-building"></i> ${companyName}</h6>
                        <p class="mb-0">${jobTitle}</p>
                    </div>
                    <div class="alert alert-info text-start">
                        <i class="bi bi-info-circle"></i> <strong>What's next?</strong>
                        <p class="mb-0 small mt-2">The company will review your profile. You'll see updates in your Match Invitations section.</p>
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonText: '<i class="bi bi-arrow-up"></i> View My Applications',
            showCancelButton: true,
            cancelButtonText: 'Stay Here',
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                // Switch to applications tab
                const applicationsTab = document.getElementById('applications-tab');
                const applicationsTabInstance = new bootstrap.Tab(applicationsTab);
                applicationsTabInstance.show();
                setTimeout(() => loadInvitations(), 500);
            } else {
                loadJobOffers(); // Refresh to update buttons
            }
        });

    } catch (error) {
        console.error('Error applying to job:', error);
        Swal.fire({
            title: 'Error',
            text: 'Could not send your application. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadInvitations();
    loadJobOffers();
});