import * as storage from "./storage"

document.addEventListener("DOMContentLoaded", () => {
    let loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"))
    if (loggedUser) {
        if (loggedUser.rol === "candidate") {
            window.location.href = "./../pages/candidateHome"
        } else {
            window.location.href = "./../pages/companyHome"
        }
    }
})

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    let formData = new FormData(e.target)
    let data = {}
    formData.forEach((value, key) => {
        console.log(`data[${key}] = ${value}`)
        data[key] = value
    })

    let userFound = await storage.verifyUser(data)

    if (userFound) {
        const miModal = new bootstrap.Modal(document.getElementById('modalRegistro'));
        miModal.show();
        return false
    }

    await storage.saveUser({...data, status: true})

})
