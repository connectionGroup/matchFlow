    const BASE_URL = "http://localhost:3001";

    /* GET */
    export async function getData(endpoint) {
        const res = await fetch(`${BASE_URL}/${endpoint}`);
        if (!res.ok) throw new Error("Error GET");
        return await res.json();
    }

    /* POST */
    export async function postData(endpoint, data) {
        const res = await fetch(`${BASE_URL}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Error POST");
        return await res.json();
    }

    /* DELETE */
    export async function deleteData(endpoint, id) {
        const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Error DELETE");
    }

    /* PUT */
    export async function putData(endpoint, id, data) {
        const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Error PUT");
        return await res.json();
    }

    /* PATCH */
    export async function patchData(endpoint, id, data) {
        const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Error PATCH");
        return await res.json();
    }


    //LOGOUT
    export function logout() {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }
