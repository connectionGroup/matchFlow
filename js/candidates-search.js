import { protectPage, getCurrentUser } from './auth.js';
import { getData, postData } from './api.js';

protectPage(['company']);
const user = getCurrentUser();

let candidates = [];
let reservations = [];
let jobOffers = [];

const candidatesList = document.getElementById('candidatesList');
const filterName = document.getElementById('filterName');
const filterSkills = document.getElementById('filterSkills');
const filterStatus = document.getElementById('filterStatus');
const btnClearFilters = document.getElementById('btnClearFilters');
const planInfoText = document.getElementById('planInfoText');

const PLAN_LIMITS = {
    free: { canViewReserved: false, advancedFilters: false },
    business: { canViewReserved: false, advancedFilters: true },
    enterprise: { canViewReserved: true, advancedFilters: true }
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    displayPlanInfo();
    renderCandidates();

    filterName.addEventListener('input', renderCandidates);
    filterSkills.addEventListener('input', renderCandidates);
    filterStatus.addEventListener('change', renderCandidates);
    btnClearFilters.addEventListener('click', clearFilters);
});

async function loadData() {
    [candidates, reservations, jobOffers] = await Promise.all([
        getData('candidates'),
        getData('reservations'),
        getData('jobOffers')
    ]);
}

function displayPlanInfo() {
    const plan = user.plan || 'free';
    const planDetails = PLAN_LIMITS[plan];

    let message = '';
    if (plan === 'free') {
        message = '<strong>Free Plan:</strong> You can see available candidates only. Upgrade to view more candidates!';
    } else if (plan === 'business') {
        message = '<strong>Business Plan:</strong> You have access to advanced skill filters.';
    } else if (plan === 'enterprise') {
        message = '<strong>Enterprise Plan:</strong> You can view ALL candidates, even reserved ones!';
    }

    planInfoText.innerHTML = message;
}

function clearFilters() {
    filterName.value = '';
    filterSkills.value = '';
    filterStatus.value = 'available';
    renderCandidates();
}

function getCandidateReservations(candidateId) {
    return reservations.filter(r => r.candidateId === candidateId && r.status === 'active');
}

function canViewCandidate(candidate) {
    const plan = user.plan || 'free';
    const candidateReservations = getCandidateReservations(candidate.id);

    if (plan === 'enterprise') {
        return true;
    }

    if (candidateReservations.length > 0) {
        return false;
    }

    return true;
}

function renderCandidates() {
    const nameFilter = filterName.value.toLowerCase().trim();
    const skillsFilter = filterSkills.value.toLowerCase().trim();
    const statusFilter = filterStatus.value;

    let filtered = candidates.filter(c => c.openToWork);

    if (nameFilter) {
        filtered = filtered.filter(c => 
            c.fullName.toLowerCase().includes(nameFilter)
        );
    }

    if (skillsFilter) {
        filtered = filtered.filter(c => 
            c.skills.some(skill => skill.toLowerCase().includes(skillsFilter))
        );
    }

    if (statusFilter === 'available') {
        filtered = filtered.filter(c => getCandidateReservations(c.id).length === 0);
    } else if (statusFilter === 'reserved') {
        filtered = filtered.filter(c => getCandidateReservations(c.id).length > 0);
    }

    const visibleCandidates = filtered.filter(c => canViewCandidate(c));

    candidatesList.innerHTML = '';

    if (visibleCandidates.length === 0) {
        candidatesList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h3>No candidates found</h3>
                <p>Try adjusting your filters or check back later</p>
            </div>
        `;
        return;
    }

    visibleCandidates.forEach(candidate => {
        const card = createCandidateCard(candidate);
        candidatesList.appendChild(card);
    });
}

function createCandidateCard(candidate) {
    const card = document.createElement('div');
    const candidateReservations = getCandidateReservations(candidate.id);
    const isReserved = candidateReservations.length > 0;
    const isReservedByMe = candidateReservations.some(r => r.companyId === user.companyId);

    card.className = `candidate-card ${isReserved ? 'reserved' : ''}`;

    const planBadgeClass = candidate.plan || 'free';
    const planLabel = {
        free: 'Free',
        pro1: 'Pro Level 1',
        pro2: 'Pro Level 2'
    }[candidate.plan || 'free'];

    card.innerHTML = `
        <div class="candidate-header">
            <div>
                <h3 class="candidate-name">
                    <i class="bi bi-person-circle"></i> ${candidate.fullName}
                </h3>
                <p class="candidate-title">${candidate.title || 'No title specified'}</p>
            </div>
            <div class="text-end">
                <span class="plan-badge ${planBadgeClass}">
                    <i class="bi bi-star-fill"></i> ${planLabel}
                </span>
                <br>
                <span class="status-badge ${isReserved ? 'reserved' : 'open'} mt-2 d-inline-block">
                    <i class="bi bi-${isReserved ? 'lock-fill' : 'unlock-fill'}"></i>
                    ${isReserved ? 'Reserved' : 'Available'}
                </span>
            </div>
        </div>

        ${candidate.skills.length > 0 ? `
            <div class="skills-container">
                <i class="bi bi-code-slash text-primary"></i>
                ${candidate.skills.map(skill => `
                    <span class="skill-badge">${skill}</span>
                `).join('')}
            </div>
        ` : ''}

        ${candidate.experience ? `
            <p><i class="bi bi-briefcase-fill text-secondary"></i> <strong>Experience:</strong> ${candidate.experience}</p>
        ` : ''}

        ${isReserved ? `
            <div class="reservation-info">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <strong>Reserved:</strong> This candidate has ${candidateReservations.length} active reservation(s).
                ${isReservedByMe ? ' <span class="badge bg-warning">You have reserved this candidate</span>' : ''}
            </div>
        ` : ''}

        <div class="mt-3">
            <button class="btn btn-primary" onclick="handleCreateMatch('${candidate.id}')">
                <i class="bi bi-heart-fill"></i> Create Match
            </button>
            <button class="btn btn-outline-warning" onclick="handleReserve('${candidate.id}')" ${isReservedByMe ? 'disabled' : ''}>
                <i class="bi bi-lock-fill"></i> ${isReservedByMe ? 'Already Reserved' : 'Reserve'}
            </button>
        </div>
    `;

    return card;
}

window.handleCreateMatch = async (candidateId) => {
    const companyOffers = jobOffers.filter(jo => jo.companyId === user.companyId && jo.status === 'open');

    if (companyOffers.length === 0) {
        Swal.fire({
            title: 'No Job Offers',
            text: 'You need to create at least one open job offer before creating a match.',
            icon: 'warning',
            confirmButtonColor: '#667eea'
        });
        return;
    }

    const { value: jobOfferId } = await Swal.fire({
        title: 'Select Job Offer',
        input: 'select',
        inputOptions: companyOffers.reduce((acc, jo) => {
            acc[jo.id] = jo.title;
            return acc;
        }, {}),
        inputPlaceholder: 'Select a job offer',
        showCancelButton: true,
        confirmButtonColor: '#667eea'
    });

    if (!jobOfferId) return;

    const candidate = candidates.find(c => c.id === candidateId);
    const selectedOffer = jobOffers.find(jo => jo.id === jobOfferId);

    Swal.fire({
        title: 'Creating Match...',
        html: `
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mb-2">Processing your match request</p>
                <div class="progress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                         role="progressbar" 
                         style="width: 100%">
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const match = {
            companyId: user.companyId,
            jobOfferId: jobOfferId,
            candidateId: candidateId,
            status: 'pending',
            initiatedBy: 'company',
            createdAt: new Date().toISOString()
        };

        await postData('matches', match);

        await Swal.fire({
            title: 'Match Created Successfully!',
            html: `
                <div class="text-center">
                    <i class="bi bi-heart-fill text-danger" style="font-size: 4rem;"></i>
                    <h4 class="mt-3">Match Details</h4>
                    
                    <div class="alert alert-primary mt-4 text-start">
                        <h6 class="mb-2"><i class="bi bi-person-circle"></i> <strong>Candidate</strong></h6>
                        <p class="mb-1">${candidate.fullName}</p>
                        <p class="mb-0 text-muted small">${candidate.title || 'No title specified'}</p>
                    </div>

                    <div class="alert alert-success text-start mb-4">
                        <h6 class="mb-2"><i class="bi bi-briefcase-fill"></i> <strong>Job Offer</strong></h6>
                        <p class="mb-1">${selectedOffer.title}</p>
                        <p class="mb-0 text-muted small">${selectedOffer.modality}</p>
                    </div>
                    
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle-fill"></i>
                        The match is now in <strong>Pending</strong> status. Move it through your pipeline from the Matches page.
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#667eea',
            confirmButtonText: 'View Matches',
            showCancelButton: true,
            cancelButtonColor: '#6c757d',
            cancelButtonText: 'Stay Here'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/pages/matches.html';
            }
        });
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Could not create match. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
};

window.handleReserve = async (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    const candidateReservations = getCandidateReservations(candidateId);
    
    const candidatePlan = candidate.plan || 'free';
    const maxReservations = {
        free: 1,
        pro1: 2,
        pro2: 5
    }[candidatePlan];

    if (candidateReservations.length >= maxReservations) {
        Swal.fire({
            title: 'Cannot Reserve',
            text: `This candidate's plan (${candidatePlan.toUpperCase()}) allows only ${maxReservations} simultaneous reservation(s). They are currently at the limit.`,
            icon: 'warning',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    const companyOffers = jobOffers.filter(jo => jo.companyId === user.companyId && jo.status === 'open');

    if (companyOffers.length === 0) {
        Swal.fire({
            title: 'No Job Offers',
            text: 'You need to create at least one open job offer before reserving a candidate.',
            icon: 'warning',
            confirmButtonColor: '#667eea'
        });
        return;
    }

    const { value: jobOfferId } = await Swal.fire({
        title: 'Reserve Candidate',
        text: 'Select a job offer for this reservation',
        input: 'select',
        inputOptions: companyOffers.reduce((acc, jo) => {
            acc[jo.id] = jo.title;
            return acc;
        }, {}),
        inputPlaceholder: 'Select a job offer',
        showCancelButton: true,
        confirmButtonColor: '#667eea'
    });

    if (!jobOfferId) return;

    const selectedOffer = jobOffers.find(jo => jo.id === jobOfferId);

    Swal.fire({
        title: 'Creating Reservation...',
        html: `
            <div class="text-center">
                <div class="spinner-border text-warning mb-3" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mb-2">Reserving candidate for your job offer</p>
                <div class="progress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                         role="progressbar" 
                         style="width: 100%">
                    </div>
                </div>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        const reservation = {
            companyId: user.companyId,
            jobOfferId: jobOfferId,
            candidateId: candidateId,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        await postData('reservations', reservation);

        await Swal.fire({
            title: 'Reservation Created Successfully!',
            html: `
                <div class="text-center">
                    <i class="bi bi-lock-fill text-warning" style="font-size: 4rem;"></i>
                    <h4 class="mt-3">Reservation Details</h4>
                    
                    <div class="alert alert-primary mt-4 text-start">
                        <h6 class="mb-2"><i class="bi bi-person-circle"></i> <strong>Candidate</strong></h6>
                        <p class="mb-1">${candidate.fullName}</p>
                        <p class="mb-0 text-muted small">${candidate.title || 'No title specified'}</p>
                    </div>

                    <div class="alert alert-warning text-start mb-4">
                        <h6 class="mb-2"><i class="bi bi-briefcase-fill"></i> <strong>Reserved For</strong></h6>
                        <p class="mb-1">${selectedOffer.title}</p>
                        <p class="mb-0 text-muted small">${selectedOffer.modality}</p>
                    </div>
                    
                    <div class="alert alert-warning">
                        <i class="bi bi-shield-lock-fill"></i>
                        This candidate is now <strong>exclusively reserved</strong> for your company. Other companies cannot see or contact them.
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#ffc107',
            confirmButtonText: 'Got it!'
        });

        await loadData();
        renderCandidates();
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Could not create reservation. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
};
