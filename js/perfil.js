const btnEditar = document.getElementById('btnEditar');
const formPerfil = document.getElementById('formPerfil');

const inputNombre = document.getElementById('nombre');
const inputEdad = document.getElementById('edad');
const inputCiudad = document.getElementById('ciudad');
const inputCorreo = document.getElementById('correo');
const inputDescripcion = document.getElementById('descripcion');

let perfilActual = null;

async function cargarPerfil() {
    const response = await fetch(PERFIL_URL);
    perfilActual = await response.json();

    seccionPerfil.innerHTML = `
        <h2>Datos profesionales</h2>
        <p><strong>Nombre:</strong> ${perfilActual.nombre}</p>
        <p><strong>Edad:</strong> ${perfilActual.edad}</p>
        <p><strong>Ciudad:</strong> ${perfilActual.ciudad || "No especificada"}</p>
        <p><strong>Correo:</strong> ${perfilActual.correo}</p>
        <p><strong>Descripción:</strong> ${perfilActual.descripcion || "Sin descripción"}</p>
    `;

    // precargar formulario
    inputNombre.value = perfilActual.nombre;
    inputEdad.value = perfilActual.edad;
    inputCiudad.value = perfilActual.ciudad;
    inputCorreo.value = perfilActual.correo;
    inputDescripcion.value = perfilActual.descripcion;
}


const seccionPerfil = document.getElementById('perfil');
const seccionOpen = document.getElementById('openToWork');

btnEditar.addEventListener('click', () => {
    formPerfil.style.display = 
        formPerfil.style.display === "none" ? "block" : "none";
});
formPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cambios = {
        nombre: inputNombre.value,
        edad: inputEdad.value,
        ciudad: inputCiudad.value,
        correo: inputCorreo.value,
        descripcion: inputDescripcion.value
    };

    await fetch(PERFIL_URL, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cambios)
    });

    formPerfil.style.display = "none";
    cargarPerfil(); // refresca datos
});


const OPEN_TO_WORK_URL = "http://localhost:4000/openToWork/1";
const PERFIL_URL = "http://localhost:4000/perfilProfesional/1";

async function cargarPerfil() {
    const response = await fetch(PERFIL_URL);
    const perfil = await response.json();

    seccionPerfil.innerHTML = `
    <h2>Datos profesionales</h2>
        <p><strong>Nombre:</strong> ${perfil.nombre}</p>
        <p><strong>Edad:</strong> ${perfil.edad}</p>
        <p><strong>Ciudad:</strong> ${perfil.ciudad || "No especificada"}</p>
        <p><strong>Correo:</strong> ${perfil.correo}</p>
        <p><strong>Descripción:</strong> ${perfil.descripcion || "Sin descripción"}</p>
    `;
    
}
async function cargarOpenToWork() {
    const response = await fetch(OPEN_TO_WORK_URL);
    const data = await response.json();

    const activo = data.status === "activo";

    seccionOpen.innerHTML = `
        <h2>Open to Work</h2>
        <p>Estado actual: 
            <strong style="color:${activo ? "green" : "red"}">
                ${data.status}
            </strong>
        </p>
        <button onclick="toggleOpenToWork('${data.status}')">
            ${activo ? "Desactivar" : "Activar"}
        </button>
    `;
}

// Activar / Desactivar Open To Work
async function toggleOpenToWork(estadoActual) {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";

    await fetch(OPEN_TO_WORK_URL, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: nuevoEstado
        })
    });

    cargarOpenToWork(); 
}


cargarPerfil();
cargarOpenToWork();