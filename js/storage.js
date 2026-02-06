/**
 * @file Lógica de negocio de MatchFlow.
 * @description Maneja la carga de datos, reglas de visibilidad, reservas y
 * renderizado de candidatos, aplicando las reglas de los planes de suscripción.
 */

import { getCurrentUser } from './auth.js';
import { getData, postData, patchData } from './api.js';

// ===================================================================
// CONFIGURACIÓN Y ESTADO GLOBAL
// ===================================================================
const API_URL = "http://localhost:3000";
const container = document.querySelector(".candidates-grid");
const searchInput = document.getElementById("searchInput");

// Estado de la aplicación: se carga desde la API.
let candidates = [];
let reservations = [];
let allCompanies = [];

// Obtenemos el usuario actual de la sesión real, no de un mock.
const currentUser = getCurrentUser();

// ===================================================================
// CARGA DE DATOS INICIAL
// ===================================================================
async function loadData() {
  try {
    // Cargamos todos los datos necesarios en paralelo para mayor eficiencia.
    const [candidatesRes, reservationsRes, companiesRes] = await Promise.all([
      getData('candidates'),
      getData('reservations'),
      getData('companies')
    ]);

    candidates = candidatesRes;
    reservations = reservationsRes;
    allCompanies = companiesRes;

    renderCandidates(searchCandidates(""));

  } catch (error) {
    console.error("Error loading data:", error);
    if (container) {
      container.innerHTML = "<p>Error al cargar los datos. Inténtalo de nuevo más tarde.</p>";
    }
  }
}

// ===================================================================
// LÓGICA DE NEGOCIO: REGLAS DE PLANES Y VISIBILIDAD
// ===================================================================

/**
 * Calcula cuántas reservas activas tiene un candidato.
 * @param {string} candidateId - El ID del candidato.
 * @returns {number} El número de reservas activas.
 */
function getActiveReservationsCount(candidateId) {
  return reservations.filter(r => r.candidateId === candidateId && r.active).length;
}

/**
 * Verifica si una empresa puede ver a un candidato según las reglas de negocio.
 * @param {object} candidate - El objeto del candidato.
 * @returns {boolean} True si la empresa puede ver al candidato.
 */
function canCompanySeeCandidate(candidate) {
  // Reglas básicas: el candidato debe estar abierto a trabajar.
  if (!candidate.openToWork) return false;

  const reservationCount = getActiveReservationsCount(candidate.id);

  // Si no hay reservas, todos los planes de empresa pueden verlo.
  if (reservationCount === 0) return true;

  // Regla para el plan "Enterprise": puede ver a TODOS los candidatos, incluso si están reservados.
  if (currentUser && currentUser.plan === 'enterprise') {
    return true;
  }

  // Regla para planes "Free" y "Business": no pueden ver candidatos que ya están reservados.
  return false;
}

/**
 * Busca y filtra candidatos según el texto de búsqueda y las reglas de visibilidad.
 * @param {string} text - El texto a buscar.
 * @returns {object[]} La lista de candidatos filtrados.
 */
function searchCandidates(text) {
  const query = text.toLowerCase().trim();

  return candidates
    .filter(canCompanySeeCandidate) // Aplicamos la regla de visibilidad primero.
    .filter(c =>
      c.fullName.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      (currentUser.plan !== 'free' && c.skills.some(skill => skill.toLowerCase().includes(query))) // Búsqueda por skills para Business/Enterprise
    );
}

// ===================================================================
// ACCIONES: RESERVAR, LIBERAR, HACER MATCH
// ===================================================================

/**
 * Intenta reservar un candidato, validando las reglas del plan del candidato.
 * @param {string} candidateId - El ID del candidato a reservar.
 */
async function reserveCandidate(candidateId) {
  const candidate = candidates.find(c => c.id === candidateId);
  if (!candidate) return;

  // Límites de reserva según el plan del CANDIDATO.
  const reservationLimits = {
    free: 1,
    pro1: 2,
    pro2: 5
  };

  const currentReservations = getActiveReservationsCount(candidateId);
  const limit = reservationLimits[candidate.plan] || 1;

  // Si el candidato ha alcanzado su límite de reservas, no se puede reservar.
  if (currentReservations >= limit) {
    Swal.fire("Límite alcanzado", "Este candidato no puede recibir más reservas en este momento.", "warning");
    return;
  }

  const reservation = {
    candidateId,
    companyId: currentUser.companyId,
    jobOfferId: "default-offer-id", // Esto debería ser dinámico en una implementación completa.
    active: true
  };

  await postData('reservations', reservation);
  loadData(); // Recargamos los datos para reflejar el cambio.
}

/**
 * Crea un "match" entre la empresa y el candidato.
 * @param {string} candidateId - El ID del candidato.
 */
async function createMatch(candidateId) {
  const match = {
    companyId: currentUser.companyId,
    jobOfferId: "default-offer-id", // Debería ser dinámico.
    candidateId: candidateId,
    status: "pending"
  };

  await postData('matches', match);
  window.location.href = "../pages/marches.html";
}

/**
 * Libera una reserva que la empresa actual ha hecho sobre un candidato.
 * @param {string} candidateId - El ID del candidato a liberar.
 */
async function releaseReservation(candidateId) {
  const reservation = reservations.find(
    r => r.active && r.candidateId === candidateId && r.companyId === currentUser.companyId
  );

  if (!reservation) return;

  await patchData(`reservations/${reservation.id}`, { active: false });
  loadData(); // Recargamos para reflejar el cambio.
}

// ===================================================================
// RENDERIZADO DE LA INTERFAZ
// ===================================================================
function renderCandidates(list) {
  if (!container) return;
  container.innerHTML = "";

  if (!currentUser) {
    container.innerHTML = "<p>Debes iniciar sesión para ver los candidatos.</p>";
    return;
  }

  if (currentUser.role !== "company") {
    container.innerHTML = "<p>Solo las cuentas de empresa pueden ver candidatos.</p>";
    return;
  }

  if (list.length === 0) {
    container.innerHTML = "<p>No se encontraron candidatos con los criterios actuales.</p>";
    return;
  }

  list.forEach(c => {
    const reservationCount = getActiveReservationsCount(c.id);
    const isReservedByMe = reservations.some(r => r.active && r.candidateId === c.id && r.companyId === currentUser.companyId);

    const card = document.createElement("div");
    card.className = "candidate-card";

    // El botón de acción cambia si el candidato está reservado por la empresa actual o no.
    let actionButton;
    if (isReservedByMe) {
      actionButton = `<button class="btn btn-secondary" onclick="window.releaseReservation('${c.id}')">Liberar</button>`;
    } else {
      actionButton = `<button class="btn btn-primary" onclick="window.reserveCandidate('${c.id}')">Reservar</button>`;
    }

    card.innerHTML = `
      ${reservationCount > 0 ? `<span class="badge">Reservado (${reservationCount})</span>` : ''}
      <h3>${c.fullName}</h3>
      <p class="candidate-role">${c.title}</p>
      <p class="candidate-skills">${c.skills.join(", ")}</p>
      
      <div class="candidate-actions">
        ${actionButton}
        <button class="btn btn-success" onclick="window.createMatch('${c.id}')">Match</button>
        <button class="btn btn-outline">Ver perfil</button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ===================================================================
// MANEJADORES DE EVENTOS E INICIALIZACIÓN
// ===================================================================

// Hacemos las funciones accesibles globalmente para los `onclick` del HTML.
window.reserveCandidate = reserveCandidate;
window.releaseReservation = releaseReservation;
window.createMatch = createMatch;

if (searchInput) {
  searchInput.addEventListener("input", e => {
    renderCandidates(searchCandidates(e.target.value));
  });
}

document.addEventListener('DOMContentLoaded', loadData);
