/**
 * @file Módulo de cierre de sesión.
 * @description Añade la funcionalidad de logout al botón con id 'btnLogout'.
 */
import { logout } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('btnLogout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});