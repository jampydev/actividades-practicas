document.addEventListener("DOMContentLoaded", function () {
    cargarDatos();
});

// Función para obtener la hora actual
function obtenerHoraActual() {
    let ahora = new Date();
    return ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Función para agregar una nueva fila a la tabla
function agregarFila(nombre = "", actividad = "", entrada = obtenerHoraActual(), salida = "", horas = "") {
    let tabla = document.querySelector("#tabla tbody");
    let fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${entrada}</td>
        <td contenteditable="true">${nombre}</td>
        <td contenteditable="true">${actividad}</td>
        <td>${horas}</td>
        <td>
            ${salida ? salida : `<button class="btn-salida">🕒 Salida</button>`}
        </td>
        <td>
            <button class="btn-eliminar">🗑 Borrar</button>
        </td>
    `;

    tabla.appendChild(fila);
    asignarEventos(fila);
    guardarDatos();
}

// Función para calcular la diferencia de horas
function calcularDiferenciaHoras(horaInicio, horaFin) {
    let formatoHora = (hora) => {
        let [h, m, s] = hora.split(":").map(Number);
        return new Date(2000, 0, 1, h, m, s);
    };

    let inicio = formatoHora(horaInicio);
    let fin = formatoHora(horaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || inicio >= fin) {
        return '<span class="advertencia">⚠ 0h 0m</span>';
    }

    let diferenciaMs = fin - inicio;
    let diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
    let horas = Math.floor(diferenciaMinutos / 60);
    let minutos = diferenciaMinutos % 60;

    return `${horas}h ${minutos}m`;
}

// Función para asignar eventos a los botones de cada fila
function asignarEventos(fila) {
    let btnSalida = fila.querySelector(".btn-salida");
    let btnEliminar = fila.querySelector(".btn-eliminar");
    let celdasEditables = fila.querySelectorAll("td[contenteditable='true']");

    if (btnSalida) {
        btnSalida.addEventListener("click", function () {
            let celdaSalida = fila.children[4];
            let celdaEntrada = fila.children[0];
            let celdaHoras = fila.children[3];

            let horaSalida = obtenerHoraActual();
            celdaSalida.innerHTML = horaSalida;

            let horaEntrada = celdaEntrada.textContent;
            let diferencia = calcularDiferenciaHoras(horaEntrada, horaSalida);
            celdaHoras.innerHTML = diferencia;

            guardarDatos();
        });
    }

    btnEliminar.addEventListener("click", function () {
        fila.remove();
        guardarDatos();
    });

    // Guardar cambios en celdas editables al escribir
    celdasEditables.forEach(celda => {
        celda.addEventListener("input", function () {
            guardarDatos();
        });
    });
}

// Función para guardar datos en localStorage
function guardarDatos() {
    let filas = document.querySelectorAll("#tabla tbody tr");
    let datos = [];

    filas.forEach(fila => {
        let celdas = fila.children;
        let filaData = {
            entrada: celdas[0].textContent,
            nombre: celdas[1].textContent,
            actividad: celdas[2].textContent,
            horas: celdas[3].textContent,
            salida: celdas[4].textContent
        };
        datos.push(filaData);
    });

    localStorage.setItem("tablaDatos", JSON.stringify(datos));
}

// Función para cargar los datos guardados en localStorage
function cargarDatos() {
    let datosGuardados = localStorage.getItem("tablaDatos");
    if (datosGuardados) {
        let datos = JSON.parse(datosGuardados);
        datos.forEach(fila => {
            agregarFila(fila.nombre, fila.actividad, fila.entrada, fila.salida, fila.horas);
        });
    }
}

// Función para reiniciar la tabla completamente
function reiniciarTabla() {
    localStorage.removeItem("tablaDatos");
    document.querySelector("#tabla tbody").innerHTML = "";
}
