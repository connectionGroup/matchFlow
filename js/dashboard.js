import { protectPage } from "./auth.js";
import { getData } from "./api.js";

protectPage(["admin"]);

document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const [users, candidates, companies, matches] = await Promise.all([
            getData('users'),
            getData('candidates'),
            getData('companies'),
            getData('matches')
        ]);

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalCandidates').textContent = candidates.length;
        document.getElementById('totalCompanies').textContent = companies.length;
        document.getElementById('totalMatches').textContent = matches.length;

        renderPlansChart([...candidates, ...companies]);
        renderMatchesChart(matches);
        renderRecentActivity(users);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function renderPlansChart(entities) {
    const planCounts = {
        free: entities.filter(e => (e.plan || 'free') === 'free').length,
        pro1: entities.filter(e => e.plan === 'pro1').length,
        pro2: entities.filter(e => e.plan === 'pro2').length,
        business: entities.filter(e => e.plan === 'business').length,
        enterprise: entities.filter(e => e.plan === 'enterprise').length
    };

    const ctx = document.getElementById('plansChart');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Free', 'Pro Level 1', 'Pro Level 2', 'Business', 'Enterprise'],
            datasets: [{
                data: [planCounts.free, planCounts.pro1, planCounts.pro2, planCounts.business, planCounts.enterprise],
                backgroundColor: ['#6c757d', '#17a2b8', '#ffc107', '#28a745', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderMatchesChart(matches) {
    const statusCounts = {
        pending: matches.filter(m => m.status === 'pending').length,
        contacted: matches.filter(m => m.status === 'contacted').length,
        interview: matches.filter(m => m.status === 'interview').length,
        hired: matches.filter(m => m.status === 'hired').length,
        discarded: matches.filter(m => m.status === 'discarded').length
    };

    const ctx = document.getElementById('matchesChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pending', 'Contacted', 'Interview', 'Hired', 'Discarded'],
            datasets: [{
                label: 'Matches',
                data: [statusCounts.pending, statusCounts.contacted, statusCounts.interview, statusCounts.hired, statusCounts.discarded],
                backgroundColor: ['#6c757d', '#17a2b8', '#ffc107', '#28a745', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderRecentActivity(users) {
    const tbody = document.getElementById('recentActivity');
    const recent = users.slice(-10).reverse();

    tbody.innerHTML = recent.map(user => `
        <tr>
            <td><i class="bi bi-person-circle"></i></td>
            <td>${user.email}</td>
            <td><span class="badge bg-primary">${user.role}</span></td>
            <td><span class="badge bg-info">${(user.plan || 'free').toUpperCase()}</span></td>
            <td><span class="badge bg-success">Active</span></td>
        </tr>
    `).join('');
}
