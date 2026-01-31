let user_email = document.getElementById('user');
let user_password = document.getElementById('password');
let button_link = document.getElementById('button');
let rol_user = document.getElementById('rol');


button_link.addEventListener('click', function (event){
    event.preventDefault();

    fetch(`http://localhost:4001/users?email=${user_email.value}&password=${user_password.value}`)
    .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const user = data[0];

                if (user.role === role_user.value) {
                    sessionStorage.setItem('session', 'yes');
                    sessionStorage.setItem('role', user.role);

                    if (user.role === "Administrador") {
                        window.location.href = "./admin.html";
                    } else {
                        window.location.href = "./usuario.html";
                    }
                } else {
                    alert("El rol seleccionado no coincide");
                }
            } else {
                alert("Usuario o contraseña incorrectos");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al conectar con el servidor");
        });
})


