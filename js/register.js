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
    if (data.role === "company") {
        await storage.saveUser(data)
    } else {
        await storage.saveUser({...data, status: true})
    }

    userFound = await storage.verifyUser(data)

    sessionStorage.setItem("loggedUser", JSON.stringify({id: userFound.id, email: userFound.email, role: userFound.role}))
    if (userFound.role === "candidate") {
        window.location.replace("./../pages/registerForm.html")
    } else {
        window.location.replace("./../pages/registerFormCompany.html")
    }
})

document.getElementById("goesToLogin").addEventListener("click", () => {
    window.location.href = "./../pages/login.html"
})
