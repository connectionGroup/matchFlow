const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));

if (!loggedUser) {
    window.location.replace("../pages/login.html");
}

const btnEditar = document.getElementById("btnEditar");
const formPerfil = document.getElementById("formPerfil");

const inputNombre = document.getElementById("nombre");
const inputEdad = document.getElementById("edad");
const inputCiudad = document.getElementById("ciudad");
const inputCorreo = document.getElementById("correo");
const inputDescripcion = document.getElementById("descripcion");

const seccionPerfil = document.getElementById("perfil");
const seccionOpen = document.getElementById("openToWork");
const logoutBtn = document.getElementById("logoutBtn");


logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("loggedUser");
    window.location.replace("../pages/login.html");
});

async function obtenerUsuario() {
    const response = await fetch("http://localhost:4000/users");
    const users = await response.json();

    return users.find(user => user.email === loggedUser.email);
}

async function cargarPerfil() {
    const usuario = await obtenerUsuario();
    if (!usuario) return;

    seccionPerfil.innerHTML = `
        <h2>Datos profesionales</h2>
        <p><strong>Nombre:</strong> ${usuario.firstName} ${usuario.lastName}</p>
        <p><strong>Correo:</strong> ${usuario.email}</p>
        <p><strong>Rol:</strong> ${usuario.role}</p>
        <p><strong>Edad:</strong> ${usuario.edad || "No especificada"}</p>
        <p><strong>Ciudad:</strong> ${usuario.ciudad || "No especificada"}</p>
        <p><strong>Descripción:</strong> ${usuario.descripcion || "No especificada"}</p>
    `;

    // Precargar formulario
    inputNombre.value = `${usuario.firstName} ${usuario.lastName}`;
    inputCorreo.value = usuario.email;
    document.getElementById("rol").value = usuario.role;
    inputEdad.value = usuario.edad || "";
    inputCiudad.value = usuario.ciudad || "";
    inputDescripcion.value = usuario.descripcion || "";
}

const btnVerOfertas = document.getElementById("btnVerOfertas");

btnVerOfertas.addEventListener("click", () => {
    // Cambia la URL 
    window.location.href = "../pages/ofertas";
});



// EDITAR PERFIL (VISUAL)

btnEditar.addEventListener("click", () => {
    formPerfil.style.display =
        formPerfil.style.display === "none" ? "block" : "none";
});

formPerfil.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = await obtenerUsuario();
    if (!usuario) return;

    const nombreCompleto = inputNombre.value.trim();
    const [firstName, ...lastNameArr] = nombreCompleto.split(" ");
    const lastName = lastNameArr.join(" ");

    const datosActualizados = {
        firstName,
        lastName,
        email: inputCorreo.value,
        edad: inputEdad.value,
        ciudad: inputCiudad.value,
        descripcion: inputDescripcion.value,
        role: usuario.role // el rol no cambia
    };

    await fetch(`http://localhost:4000/users/${usuario.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datosActualizados)
    });

    alert("Perfil actualizado correctamente");
    formPerfil.style.display = "none";
    cargarPerfil();
});


const OPEN_TO_WORK_URL = "http://localhost:4000/openToWork/1";

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
        <button id="toggleOpen">
            ${activo ? "Desactivar" : "Activar"}
        </button>
    `;

    document.getElementById("toggleOpen").addEventListener("click", () =>
        toggleOpenToWork(data.status)
    );
}

async function toggleOpenToWork(estadoActual) {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";

    await fetch(OPEN_TO_WORK_URL, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nuevoEstado })
    });

    cargarOpenToWork();
}

cargarPerfil();
cargarOpenToWork();
