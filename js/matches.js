import { protectPage, getCurrentUser } from './auth.js';
import { getData, patchData, deleteData } from './api.js';

protectPage(['company']);
const user = getCurrentUser();

let matches = [];
let candidates = [];
let jobOffers = [];
let currentFilter = 'all';

const matchesList = document.getElementById('matchesList');
const pipelineTabs = document.querySelectorAll('.pipeline-tab');

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderMatches();

    pipelineTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            pipelineTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.status;
            renderMatches();
        });
    });
});

async function loadData() {
    const [allMatches, allCandidates, allJobOffers] = await Promise.all([
        getData('matches'),
        getData('candidates'),
        getData('jobOffers')
    ]);

    matches = allMatches.filter(m => m.companyId === user.companyId);
    candidates = allCandidates;
    jobOffers = allJobOffers;
}

function renderMatches() {
    let filtered = matches;

    if (currentFilter !== 'all') {
        filtered = matches.filter(m => m.status === currentFilter);
    }

    matchesList.innerHTML = '';

    if (filtered.length === 0) {
        matchesList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h3>No matches found</h3>
                <p>${currentFilter === 'all' ? 'Start by finding candidates and creating matches!' : `No matches in ${currentFilter} status`}</p>
                <a href="candidates-search.html" class="btn btn-primary mt-3">
                    <i class="bi bi-search"></i> Find Candidates
                </a>
            </div>
        `;
        return;
    }

    filtered.forEach(match => {
        const card = createMatchCard(match);
        matchesList.appendChild(card);
    });
}

function createMatchCard(match) {
    const candidate = candidates.find(c => c.id === match.candidateId);
    const jobOffer = jobOffers.find(jo => jo.id === match.jobOfferId);

    if (!candidate || !jobOffer) {
        return document.createElement('div');
    }

    const card = document.createElement('div');
    card.className = 'match-card';

    const showContact = match.status === 'contacted' || match.status === 'interview' || match.status === 'hired';

    const statusIcons = {
        pending: 'clock',
        contacted: 'envelope-check',
        interview: 'people',
        hired: 'check-circle',
        discarded: 'x-circle'
    };

    card.innerHTML = `
        <div class="match-header">
            <h3 class="match-title">
                <i class="bi bi-person-circle"></i> ${candidate.fullName}
            </h3>
            <span class="match-status ${match.status}">
                <i class="bi bi-${statusIcons[match.status]}"></i> ${match.status.toUpperCase()}
            </span>
        </div>

        <div class="match-info">
            <div class="match-info-item">
                <div class="match-info-label">
                    <i class="bi bi-briefcase"></i> Job Offer
                </div>
                <div class="match-info-value">${jobOffer.title}</div>
            </div>
            <div class="match-info-item">
                <div class="match-info-label">
                    <i class="bi bi-calendar"></i> Created
                </div>
                <div class="match-info-value">${formatDate(match.createdAt)}</div>
            </div>
            <div class="match-info-item">
                <div class="match-info-label">
                    <i class="bi bi-star"></i> Candidate Plan
                </div>
                <div class="match-info-value">${(candidate.plan || 'free').toUpperCase()}</div>
            </div>
        </div>

        ${candidate.title ? `
            <p><i class="bi bi-award"></i> <strong>Title:</strong> ${candidate.title}</p>
        ` : ''}

        ${candidate.skills.length > 0 ? `
            <p>
                <i class="bi bi-code-slash"></i> <strong>Skills:</strong> 
                ${candidate.skills.map(s => `<span class="badge bg-info">${s}</span>`).join(' ')}
            </p>
        ` : ''}

        ${showContact ? `
            <div class="contact-info">
                <h5><i class="bi bi-telephone-fill"></i> Contact Information</h5>
                <p><strong>Phone:</strong> ${candidate.contact?.phone || 'Not provided'}</p>
                ${candidate.contact?.whatsapp ? `
                    <a href="${candidate.contact.whatsapp}" target="_blank" class="btn btn-success btn-sm">
                        <i class="bi bi-whatsapp"></i> Contact via WhatsApp
                    </a>
                ` : ''}
            </div>
        ` : `
            <div class="contact-info locked">
                <i class="bi bi-lock-fill"></i> Contact information will be available once you change status to <strong>CONTACTED</strong>
            </div>
        `}

        <div class="mt-3 d-flex gap-2 flex-wrap">
            ${match.status === 'pending' ? `
                <button class="btn btn-primary btn-action" onclick="updateMatchStatus('${match.id}', 'contacted')">
                    <i class="bi bi-envelope-check"></i> Mark as Contacted
                </button>
            ` : ''}
            
            ${match.status === 'contacted' ? `
                <button class="btn btn-warning btn-action" onclick="updateMatchStatus('${match.id}', 'interview')">
                    <i class="bi bi-people"></i> Schedule Interview
                </button>
            ` : ''}
            
            ${match.status === 'interview' ? `
                <button class="btn btn-success btn-action" onclick="updateMatchStatus('${match.id}', 'hired')">
                    <i class="bi bi-check-circle"></i> Hire
                </button>
            ` : ''}
            
            ${match.status !== 'hired' && match.status !== 'discarded' ? `
                <button class="btn btn-danger btn-action" onclick="updateMatchStatus('${match.id}', 'discarded')">
                    <i class="bi bi-x-circle"></i> Discard
                </button>
            ` : ''}

            <button class="btn btn-outline-secondary btn-action" onclick="deleteMatch('${match.id}')">
                <i class="bi bi-trash"></i> Delete
            </button>
        </div>
    `;

    return card;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

window.updateMatchStatus = async (matchId, newStatus) => {
    try {
        const statusIcons = {
            contacted: 'telephone-fill',
            interview: 'calendar-check-fill',
            hired: 'trophy-fill',
            discarded: 'x-circle-fill'
        };

        const statusColors = {
            contacted: 'info',
            interview: 'warning',
            hired: 'success',
            discarded: 'danger'
        };

        Swal.fire({
            title: 'Updating Pipeline...',
            html: `
                <div class="text-center">
                    <div class="spinner-border text-${statusColors[newStatus]} mb-2" role="status" style="width: 2.5rem; height: 2.5rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Moving match to ${newStatus}...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await patchData(`matches`, matchId, { status: newStatus });

        await Swal.fire({
            title: 'Pipeline Updated!',
            html: `
                <div class="text-center">
                    <i class="bi bi-${statusIcons[newStatus]} text-${statusColors[newStatus]}" style="font-size: 3.5rem;"></i>
                    <h4 class="mt-3">Status: ${newStatus.toUpperCase()}</h4>
                    <p class="text-muted">Match has been moved to the next stage</p>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#667eea',
            timer: 2000,
            showConfirmButton: false
        });

        await loadData();
        renderMatches();
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Could not update match status',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
};

window.deleteMatch = async (matchId) => {
    const result = await Swal.fire({
        title: 'Delete Match?',
        text: 'This action cannot be undone',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
        Swal.fire({
            title: 'Deleting Match...',
            html: `
                <div class="text-center">
                    <div class="spinner-border text-danger mb-2" role="status" style="width: 2.5rem; height: 2.5rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Removing match from pipeline...</p>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await deleteData('matches', matchId);

        await Swal.fire({
            title: 'Deleted!',
            html: `
                <div class="text-center">
                    <i class="bi bi-trash-fill text-danger" style="font-size: 3.5rem;"></i>
                    <h4 class="mt-3">Match Removed</h4>
                    <p class="text-muted">The match has been permanently deleted</p>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#667eea',
            timer: 2000,
            showConfirmButton: false
        });

        await loadData();
        renderMatches();
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: 'Could not delete match',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
};
