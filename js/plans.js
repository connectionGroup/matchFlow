import { getCurrentUser } from './auth.js';
import { getData, patchData } from './api.js';

const user = getCurrentUser();

if (!user) {
    window.location.href = '/pages/login.html';
}

let selectedPlan = null;
let selectedRole = null;
let paymentModal = null;

const PLAN_PRICES = {
    candidate: {
        free: 0,
        pro1: 29,
        pro2: 59
    },
    company: {
        free: 0,
        business: 99,
        enterprise: 199
    }
};

const PLAN_NAMES = {
    free: 'Free Plan',
    pro1: 'Pro Level 1',
    pro2: 'Pro Level 2',
    business: 'Business Plan',
    enterprise: 'Enterprise Plan'
};

document.addEventListener('DOMContentLoaded', async () => {
    const candidatePlansSection = document.getElementById('candidate-plans');
    const companyPlansSection = document.getElementById('company-plans');
    const btnBack = document.getElementById('btnBack');

    paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));

    if (user.role === 'candidate') {
        candidatePlansSection.style.display = 'block';
        await loadCandidatePlans();
    } else if (user.role === 'company') {
        companyPlansSection.style.display = 'block';
        await loadCompanyPlans();
    }

    btnBack.addEventListener('click', () => {
        if (user.role === 'candidate') {
            window.location.href = '/pages/candidate.html';
        } else if (user.role === 'company') {
            window.location.href = '/pages/company.html';
        }
    });

    setupPaymentForm();
});

async function loadCandidatePlans() {
    const currentPlan = user.plan || 'free';
    const planCards = document.querySelectorAll('[data-role="candidate"]');

    planCards.forEach(card => {
        const planType = card.dataset.plan;
        const button = card.querySelector('.plan-btn');

        if (planType === currentPlan) {
            card.classList.add('current');
            button.textContent = '✓ Current Plan';
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.disabled = true;
        } else {
            button.addEventListener('click', () => changePlan(planType, 'candidate'));
        }
    });
}

async function loadCompanyPlans() {
    const currentPlan = user.plan || 'free';
    const planCards = document.querySelectorAll('[data-role="company"]');

    planCards.forEach(card => {
        const planType = card.dataset.plan;
        const button = card.querySelector('.plan-btn');

        if (planType === currentPlan) {
            card.classList.add('current');
            button.textContent = '✓ Current Plan';
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.disabled = true;
        } else {
            button.addEventListener('click', () => changePlan(planType, 'company'));
        }
    });
}

async function changePlan(newPlan, role) {
    const price = PLAN_PRICES[role][newPlan];
    
    if (price === 0) {
        Swal.fire({
            title: 'Downgrade Plan',
            text: 'You cannot downgrade to the free plan. Please contact support.',
            icon: 'info',
            confirmButtonColor: '#667eea'
        });
        return;
    }

    selectedPlan = newPlan;
    selectedRole = role;

    document.getElementById('selectedPlanName').textContent = PLAN_NAMES[newPlan];
    document.getElementById('selectedPlanPrice').textContent = `$${price}/month`;

    document.getElementById('paymentForm').reset();
    paymentModal.show();
}

function setupPaymentForm() {
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    const btnProcessPayment = document.getElementById('btnProcessPayment');

    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    expiryDateInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    cvvInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    btnProcessPayment.addEventListener('click', async () => {
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        const expiryDate = expiryDateInput.value;
        const cvv = cvvInput.value;
        const cardholderName = document.getElementById('cardholderName').value;

        if (!validatePaymentForm(cardNumber, expiryDate, cvv, cardholderName)) {
            return;
        }

        await processPayment();
    });
}

function validatePaymentForm(cardNumber, expiryDate, cvv, cardholderName) {
    if (!cardholderName.trim()) {
        Swal.fire({
            title: 'Invalid Input',
            text: 'Please enter the cardholder name',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
        return false;
    }

    if (cardNumber.length !== 16) {
        Swal.fire({
            title: 'Invalid Card Number',
            text: 'Card number must be 16 digits',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
        return false;
    }

    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
        Swal.fire({
            title: 'Invalid Expiry Date',
            text: 'Please enter a valid expiry date (MM/YY)',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
        return false;
    }

    const [month, year] = expiryDate.split('/').map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (month < 1 || month > 12) {
        Swal.fire({
            title: 'Invalid Month',
            text: 'Month must be between 01 and 12',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
        return false;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        Swal.fire({
            title: 'Card Expired',
            text: 'This card has expired',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
        return false;
    }

    if (cvv.length !== 3) {
        Swal.fire({
            title: 'Invalid CVV',
            text: 'CVV must be 3 digits',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
        return false;
    }

    return true;
}

async function processPayment() {
    paymentModal.hide();

    Swal.fire({
        title: 'Processing Payment...',
        html: `
            <div class="text-center">
                <div class="spinner-border text-success mb-3" role="status" style="width: 3.5rem; height: 3.5rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h5 class="mb-3">Please wait while we process your payment</h5>
                <div class="progress mb-3" style="height: 25px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                         role="progressbar" 
                         style="width: 0%" 
                         id="paymentProgress">
                        <span id="progressText">0%</span>
                    </div>
                </div>
                <p class="text-muted small">
                    <i class="bi bi-shield-check"></i> Secure payment processing
                </p>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            simulatePaymentProgress();
        }
    });

    await new Promise(resolve => setTimeout(resolve, 3500));

    try {
        await patchData(`users`, user.id, { plan: selectedPlan });

        if (selectedRole === 'candidate') {
            await patchData(`candidates`, user.candidateId, { plan: selectedPlan });
        } else if (selectedRole === 'company') {
            await patchData(`companies`, user.companyId, { plan: selectedPlan });
        }

        const updatedUser = { ...user, plan: selectedPlan };
        localStorage.setItem('matchflow_user', JSON.stringify(updatedUser));

        const price = PLAN_PRICES[selectedRole][selectedPlan];

        await Swal.fire({
            title: 'Payment Successful!',
            html: `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                    <h4 class="mt-3">Welcome to ${PLAN_NAMES[selectedPlan]}</h4>
                    <p class="text-muted">Your payment of $${price} has been processed</p>
                    <div class="alert alert-success mt-3">
                        <i class="bi bi-info-circle-fill"></i>
                        A confirmation email has been sent to your registered email address
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonColor: '#667eea',
            confirmButtonText: 'Continue'
        });

        location.reload();
    } catch (error) {
        Swal.fire({
            title: 'Payment Failed',
            text: 'Could not process your payment. Please try again.',
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }
}

function simulatePaymentProgress() {
    const progressBar = document.getElementById('paymentProgress');
    const progressText = document.getElementById('progressText');
    let progress = 0;
    const interval = setInterval(() => {
        progress += 8;
        if (progress > 100) progress = 100;
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progressText) {
            progressText.textContent = Math.round(progress) + '%';
        }
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 280);
}
