import * as storage from "./storage.js"

document.addEventListener("DOMContentLoaded", () => {
    let loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"))
    if (!loggedUser) {
        window.location.replace("./../pages/login.html")
    }
})

document.getElementById("registerFormFinish").addEventListener("submit", async (e) => {
    e.preventDefault()

    let formData = new FormData(e.target)
    let data = {}
    formData.forEach((value, key) => {
        console.log(`data[${key}] = ${value}`)
        data[key] = value
    })

    const checkboxes = document.querySelectorAll('#registerFormFinish input[type="checkbox"]:checked');
    const skills = Array.from(checkboxes).map(cb => cb.value);
    data["skills"] = [...skills]

    let user = JSON.parse(sessionStorage.getItem("loggedUser"))

    let userFound = await storage.verifyUser(user)
    await storage.saveCandidate({...userFound, title: data.title, years: data.years, phone: data.phone, skills})
    window.location.replace("./../pages/registerForm.html")
})
