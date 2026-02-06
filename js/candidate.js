// js/candidate.js
import { protectPage } from "./../js/auth.js";

// Solo "candidate" puede acceder
const user = protectPage(["candidate"]);

if (user) {
    console.log("Bienvenido candidato:", user.email);
}
