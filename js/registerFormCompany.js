import * as storage from "./storage.js"

document.addEventListener("DOMContentLoaded", () => {
    let loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"))
    if (!loggedUser) {
        window.location.replace("./../pages/login.html")
    }
})

document.getElementById("registerFormFinishCompany").addEventListener("submit", async (e) => {
    e.preventDefault()

    let formData = new FormData(e.target)
    let data = {}
    formData.forEach((value, key) => {
        console.log(`data[${key}] = ${value}`)
        data[key] = value
    })

    let user = JSON.parse(sessionStorage.getItem("loggedUser"))

    let userFound = await storage.verifyUser(user)

    await storage.saveCompany({...userFound, ...data})
    window.location.replace("./../pages/company.html")
})
