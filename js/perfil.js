// Obtiene el usuario logueado desde sessionStorage
const loggedUser = JSON.parse(sessionStorage.getItem("loggedUser"));

// Si no hay usuario logueado, redirige al login
if (!loggedUser) {
    window.location.replace("../pages/login.html");
}

// Referencias a botones y formulario
const btnEditar = document.getElementById("btnEditar");
const formPerfil = document.getElementById("formPerfil");

// Inputs del formulario de perfil
const inputNombre = document.getElementById("nombre");
const inputEdad = document.getElementById("edad");
const inputCiudad = document.getElementById("ciudad");
const inputCorreo = document.getElementById("correo");
const inputDescripcion = document.getElementById("descripcion");

// Secciones donde se renderiza la información
const seccionPerfil = document.getElementById("perfil");
const seccionOpen = document.getElementById("openToWork");
const logoutBtn = document.getElementById("logoutBtn");

// Evento para cerrar sesión
logoutBtn.addEventListener("click", () => {
    // Elimina el usuario de la sesión
    sessionStorage.removeItem("loggedUser");
    // Redirige al login
    window.location.replace("../pages/login.html");
});

// Obtiene el usuario actual desde el backend
async function obtenerUsuario() {
    const response = await fetch("http://localhost:4000/users");
    const users = await response.json();

    // Devuelve el usuario que coincide con el email logueado
    return users.find(user => user.email === loggedUser.email);
}

// Carga los datos del perfil en pantalla
async function cargarPerfil() {
    const usuario = await obtenerUsuario();
    if (!usuario) return;

    // Renderiza los datos del usuario
    seccionPerfil.innerHTML = `
        <h2>Datos profesionales</h2>
        <p><strong>Nombre:</strong> ${usuario.firstName} ${usuario.lastName}</p>
        <p><strong>Correo:</strong> ${usuario.email}</p>
        <p><strong>Rol:</strong> ${usuario.role}</p>
        <p><strong>Edad:</strong> ${usuario.edad || "No especificada"}</p>
        <p><strong>Ciudad:</strong> ${usuario.ciudad || "No especificada"}</p>
        <p><strong>Descripción:</strong> ${usuario.descripcion || "No especificada"}</p>
    `;

    // Precarga el formulario con los datos actuales
    inputNombre.value = `${usuario.firstName} ${usuario.lastName}`;
    inputCorreo.value = usuario.email;
    document.getElementById("rol").value = usuario.role;
    inputEdad.value = usuario.edad || "";
    inputCiudad.value = usuario.ciudad || "";
    inputDescripcion.value = usuario.descripcion || "";
}

// Botón para ver ofertas
const btnVerOfertas = document.getElementById("btnVerOfertas");

btnVerOfertas.addEventListener("click", () => {
    // Redirige a la página de ofertas
    window.location.href = "../pages/ofertas";
});

// Mostrar / ocultar formulario de edición
btnEditar.addEventListener("click", () => {
    // Alterna la visibilidad del formulario
    formPerfil.style.display =
        formPerfil.style.display === "none" ? "block" : "none";
});

// Envío del formulario de edición
formPerfil.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita recargar la página

    const usuario = await obtenerUsuario();
    if (!usuario) return;

    // Separa nombre y apellido
    const nombreCompleto = inputNombre.value.trim();
    const [firstName, ...lastNameArr] = nombreCompleto.split(" ");
    const lastName = lastNameArr.join(" ");

    // Datos actualizados del perfil
    const datosActualizados = {
        firstName,
        lastName,
        email: inputCorreo.value,
        edad: inputEdad.value,
        ciudad: inputCiudad.value,
        descripcion: inputDescripcion.value,
        role: usuario.role 
    };

    // Actualiza el usuario en el backend
    await fetch(`http://localhost:4000/users/${usuario.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datosActualizados)
    });

    // Feedback al usuario
    alert("Perfil actualizado correctamente");
    formPerfil.style.display = "none";
    cargarPerfil(); // Recarga los datos actualizados
});

// URL del estado Open To Work
const OPEN_TO_WORK_URL = "http://localhost:4000/openToWork/1";

// Carga el estado Open To Work
async function cargarOpenToWork() {
    const response = await fetch(OPEN_TO_WORK_URL);
    const data = await response.json();

    const activo = data.status === "activo";

    // Renderiza el estado actual
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

    // Evento para cambiar el estado
    document.getElementById("toggleOpen").addEventListener("click", () =>
        toggleOpenToWork(data.status)
    );
}

// Cambia el estado Open To Work
async function toggleOpenToWork(estadoActual) {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";

    await fetch(OPEN_TO_WORK_URL, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nuevoEstado })
    });

    cargarOpenToWork(); // Actualiza la vista
}

cargarPerfil();
cargarOpenToWork();
