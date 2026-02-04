import * as storage from "./storage.js"

document.addEventListener("DOMContentLoaded", () => {
    let loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"))
    if (loggedUser) {
        if (loggedUser.role === "candidate") {
            window.location.replace("./../pages/candidateHome.html")
        } else {
            window.location.replace("./../pages/companyHome.html")
        }
    }
})

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    let formData = new FormData(e.target)
    let data = {}
    formData.forEach((value, key) => {
        console.log(`data[${key}] = ${value}`)
        data[key] = value
    })

    const userFound = await storage.verifyUser(data)

    if(!userFound) {
        const miModal = new bootstrap.Modal(document.getElementById('modalRegistro'));
        miModal.show();
        return false
    }

    sessionStorage.setItem("loggedUser", JSON.stringify({email: userFound.email, role: userFound.role}))
    if (userFound.role === "candidate") {
        window.location.replace("./../pages/perfil.html")
    } else {
        window.location.replace("./../pages/companyHome.html")
    }
})