// js/dashboard.js
import { protectPage } from "./../js/auth.js";

// Solo "admin" puede acceder
const user = protectPage(["admin"]);

if (user) {
    console.log("Bienvenido admin:", user.email);
}
