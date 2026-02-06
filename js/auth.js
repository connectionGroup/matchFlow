/**
 * @file Módulo de autenticación y gestión de sesión.
 * @description Centraliza la lógica para manejar el estado del usuario,
 * proteger rutas y gestionar el ciclo de vida de la sesión.
 */

const USER_STORAGE_KEY = 'matchflow_user';

/**
 * Obtiene el usuario actualmente logueado desde localStorage.
 * @returns {object | null} El objeto del usuario o null si no hay sesión.
 */
export function getCurrentUser() {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
}

/**
 * Guarda los datos del usuario en localStorage para iniciar sesión.
 * @param {object} userData - Los datos del usuario a guardar.
 */
export function login(userData) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
}

/**
 * Elimina los datos del usuario de localStorage para cerrar sesión.
 */
export function logout() {
    localStorage.clear();
    window.location.href = '/pages/login.html';
}

/**
 * Verifica si hay un usuario autenticado.
 * @returns {boolean} True si el usuario está logueado, false en caso contrario.
 */
export function isAuthenticated() {
    return !!getCurrentUser();
}

/**
 * Protege una página, redirigiendo si el usuario no está autenticado
 * o no tiene el rol adecuado.
 * @param {string[]} allowedRoles - Un array de roles permitidos para la página.
 */
export function protectPage(allowedRoles) {
    const user = getCurrentUser();

    // Si no hay usuario y la página no es pública, redirige al login.
    if (!user) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Si el rol del usuario no está en la lista de roles permitidos,
    // lo redirige a su página principal.
    if (!allowedRoles.includes(user.role)) {
        redirectToRoleHomepage(user.role);
    }
}

/**
 * Redirige al usuario a su página de inicio según su rol.
 * @param {string} role - El rol del usuario ('admin', 'company', 'candidate').
 */
export function redirectToRoleHomepage(role) {
    switch (role) {
        case 'admin':
            window.location.href = '/pages/dashboard.html';
            break;
        case 'company':
            window.location.href = '/pages/company.html';
            break;
        case 'candidate':
            window.location.href = '/pages/candidate.html';
            break;
        default:
            // Si el rol es desconocido, por seguridad lo enviamos al login.
            window.location.href = '/pages/login.html';
            break;
    }
}