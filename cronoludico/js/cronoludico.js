let tiempoRestante = 30;
let marcadorValor  = 0;
let intentos       = 0;
let intervalo      = null;
let juegoActivo    = false;
let nombreActual   = '';
let ultimoClick    = 0;

const campoNom      = document.querySelector('#campoNom');
const btnReg        = document.querySelector('#btnReg');
const btnJugar      = document.querySelector('#btnJugar');
const btnRei        = document.querySelector('#btnRei');
const btnMas        = document.querySelector('#btnMas');
const btnMenos      = document.querySelector('#btnMenos');
const temporizador  = document.querySelector('#temporizador');
const marcador      = document.querySelector('#marcador');
const mensajeEstado = document.querySelector('#mensajeEstado');
const divResultado  = document.querySelector('#divResultado');
const grupoRegistro = document.querySelector('#grupoRegistro');

/*Cierre manual de modales: mueve el foco antes de ocultar el modal
  evita la advertencia aria-hidden sobre descendientes con foco — accesibilidad WAI-ARIA
  data-bs-dismiss fue removido de todos los botones por este motivo*/
function cerrarModal(modal, destino)
{
    /*hidden.bs.modal se dispara cuando Bootstrap terminó completamente el cierre y removió aria-hidden
      recién ahí es seguro mover el foco — evita la advertencia de accesibilidad WAI-ARIA
      once:true para que el listener no se acumule en cada cierre*/
    modal._element.addEventListener('hidden.bs.modal', function() {destino.focus();}, {once: true});
    modal.hide();
}

if (btnReg)
{
    //Registro del jugador

    btnReg.addEventListener('click', function(e)
    {
        e.preventDefault();

        const regexNombre = /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]{3,30}$/;
        const nombre = campoNom.value.trim();

        if (!regexNombre.test(nombre))
        {
            campoNom.classList.add('is-invalid');
            return false;
        }

        campoNom.classList.remove('is-invalid');
        campoNom.classList.add('is-valid');
        campoNom.disabled = true;

        nombreActual = nombre;
        btnReg.disabled = true;
        btnJugar.disabled = false;
        mensajeEstado.textContent = 'Presioná Iniciar para comenzar.';
    });

    //Inicio del juego

    btnJugar.addEventListener('click', function(e)
    {
        e.preventDefault();

        intentos++;
        tiempoRestante = 30;
        marcadorValor  = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 7);
        juegoActivo    = true;

        btnJugar.disabled = true;
        btnMas.disabled   = false;
        btnMenos.disabled = false;

        divResultado.textContent  = '';
        mensajeEstado.textContent = 'Llegá exactamente a 0.';

        actualizarVista();
        programarAzar();

        /*setInterval descuenta 1 segundo por tick, actualiza el color del temporizador
          y detecta si se llegó a 0 para resolver empate o derrota*/
        intervalo = setInterval(function()
        {
            tiempoRestante--;
            actualizarTemporizador();

            if (tiempoRestante <= 0)
            {
                clearInterval(intervalo);
                clearTimeout(window.azar);
                juegoActivo = false;
                if (marcadorValor === 0) {empate();} else {derrota();}
            }
        }, 1000);
    });

    /*Azar automático: setTimeout recursivo fijo de 3 segundos
      cambia el valor y el signo del marcador sin aviso para mantener la tensión
      para ajustar la dificultad: modificar el delay en programarAzar(), los valores
      del marcador (actualmente ±7 a ±14) y el cooldown de los botones (actualmente 300ms)*/
    function programarAzar()
    {
        window.azar = setTimeout(function()
        {
            if (!juegoActivo) return;

            marcadorValor = (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 7);
            if (marcadorValor > 15)  {marcadorValor =  30;}
            if (marcadorValor < -15) {marcadorValor = -30;}

            mensajeEstado.textContent = 'Llegá exactamente a 0.';
            actualizarVista();
            verificarVictoria();
            programarAzar();
        }, 3000);
    }

    //Botones + y -

    /*Cooldown de 500ms — si clickea más rápido el azar se acelera*/
    btnMas.addEventListener('click', function(e)
    {
        e.preventDefault();
        if (!juegoActivo) return;

        const ahora = Date.now();
        const intervaloClick = ahora - ultimoClick;
        if (intervaloClick < 300) return;
        ultimoClick = ahora;

        if (marcadorValor >= 15) {mensajeEstado.textContent = '¡Tope del futuro alcanzado!'; return;}

        mensajeEstado.textContent = 'Llegá exactamente a 0.';
        marcadorValor++;
        actualizarVista();
        verificarVictoria();
    });

    btnMenos.addEventListener('click', function(e)
    {
        e.preventDefault();
        if (!juegoActivo) return;

        const ahora = Date.now();
        const intervaloClick = ahora - ultimoClick;
        if (intervaloClick < 300) return;
        ultimoClick = ahora;

        if (marcadorValor <= -15) {mensajeEstado.textContent = '¡Tope del pasado alcanzado!'; return;}

        mensajeEstado.textContent = 'Llegá exactamente a 0.';
        marcadorValor--;
        actualizarVista();
        verificarVictoria();
    });

    //Reinicio

    btnRei.addEventListener('click', function(e)
    {
        e.preventDefault();

        clearInterval(intervalo);
        clearTimeout(window.azar);
        juegoActivo    = false;
        tiempoRestante = 30;
        marcadorValor  = 0;
        nombreActual   = '';
        intentos       = 0;
        ultimoClick    = 0;

        temporizador.textContent  = '30';
        temporizador.className    = 'display-1 fw-bold lh-1 mb-1';
        marcador.textContent      = '';
        mensajeEstado.textContent = '';
        divResultado.textContent  = '';

        campoNom.value = '';
        campoNom.disabled = false;
        campoNom.classList.remove('is-valid', 'is-invalid');
        btnReg.disabled   = false;
        btnJugar.disabled = true;
        btnMas.disabled   = true;
        btnMenos.disabled = true;
        grupoRegistro.style.display = '';
    });

    //Funciones auxiliares

    /*Muestra solo el signo del marcador — el jugador no sabe el valor exacto*/
    function actualizarVista()
    {
        if      (marcadorValor > 0) {marcador.textContent = '+';}
        else if (marcadorValor < 0) {marcador.textContent = '−';}
        else                        {marcador.textContent = '0';}
    }

    /*Cambia el color del temporizador según el tiempo restante*/
    function actualizarTemporizador()
    {
        temporizador.textContent = tiempoRestante;
        temporizador.classList.remove('timer-amarillo', 'timer-naranja', 'timer-rojo');
        if      (tiempoRestante <= 10) {temporizador.classList.add('timer-rojo');}
        else if (tiempoRestante <= 20) {temporizador.classList.add('timer-naranja');}
        else if (tiempoRestante <= 25) {temporizador.classList.add('timer-amarillo');}
    }

    function finDeRonda()
    {
        btnMas.disabled   = true;
        btnMenos.disabled = true;
        btnJugar.disabled = false;
    }

    function verificarVictoria()
    {
        if (marcadorValor !== 0) return;
        if (tiempoRestante <= 0) {empate(); return;}

        clearInterval(intervalo);
        clearTimeout(window.azar);
        juegoActivo = false;

        divResultado.textContent  = '¡Victoria! Tiempo restante: ' + tiempoRestante + 's';
        mensajeEstado.textContent = '¡Lograste permanecer en el presente!';
        document.querySelector('#modalVictoriaBody').textContent = '¡Lograste permanecer en el presente! Tiempo restante: ' + tiempoRestante + 's.';
        modalVictoria.show();

        guardarVictoria(nombreActual, tiempoRestante);
        finDeRonda();
    }

    function empate()
    {
        divResultado.textContent  = '¡EMPATE ÉPICO! El tiempo y el presente colisionaron.';
        mensajeEstado.textContent = 'Un instante legendario. No se registra en la tabla.';
        modalEmpate.show();
        finDeRonda();
    }

    function derrota()
    {
        divResultado.textContent  = 'Derrota. El tiempo venció al presente.';
        mensajeEstado.textContent = '';
        document.querySelector('#modalDerrotaBody').textContent = 'El tiempo venció al presente. No lograste permanecer en el 0.';
        modalDerrota.show();
        finDeRonda();
    }

    //Modales de resultado

    document.body.insertAdjacentHTML('beforeend',
        '<div class="modal fade" id="modalVictoria" tabindex="-1" aria-labelledby="modalVictoriaLabel" aria-hidden="true">' +
            '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">' +
                '<div class="modal-header bg-success text-white">' +
                    '<h5 class="modal-title" id="modalVictoriaLabel">🏆 ¡Ganaste!</h5>' +
                    '<button type="button" class="btn-close btn-close-white" id="btnXVictoria" aria-label="Cerrar"></button>' +
                '</div>' +
                '<div class="modal-body" id="modalVictoriaBody"></div>' +
                '<div class="modal-footer"><button type="button" class="btn btn-success" id="btnCerrarVictoria">Aceptar</button></div>' +
            '</div></div>' +
        '</div>' +
        '<div class="modal fade" id="modalDerrota" tabindex="-1" aria-labelledby="modalDerrotaLabel" aria-hidden="true">' +
            '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">' +
                '<div class="modal-header bg-danger text-white">' +
                    '<h5 class="modal-title" id="modalDerrotaLabel">💀 ¡Perdiste!</h5>' +
                    '<button type="button" class="btn-close btn-close-white" id="btnXDerrota" aria-label="Cerrar"></button>' +
                '</div>' +
                '<div class="modal-body" id="modalDerrotaBody"></div>' +
                '<div class="modal-footer"><button type="button" class="btn btn-danger" id="btnCerrarDerrota">Cerrar</button></div>' +
            '</div></div>' +
        '</div>' +
        '<div class="modal fade" id="modalEmpate" tabindex="-1" aria-labelledby="modalEmpateLabel" aria-hidden="true">' +
            '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">' +
                '<div class="modal-header bg-warning text-dark">' +
                    '<h5 class="modal-title" id="modalEmpateLabel">⚡ ¡Empate épico!</h5>' +
                    '<button type="button" class="btn-close" id="btnXEmpate" aria-label="Cerrar"></button>' +
                '</div>' +
                '<div class="modal-body">El tiempo y el presente colisionaron en el mismo instante. Un momento legendario que no se registra en la tabla.</div>' +
                '<div class="modal-footer"><button type="button" class="btn btn-warning" id="btnCerrarEmpate">Cerrar</button></div>' +
            '</div></div>' +
        '</div>'
    );

    const modalVictoria = new bootstrap.Modal(document.querySelector('#modalVictoria'));
    const modalDerrota  = new bootstrap.Modal(document.querySelector('#modalDerrota'));
    const modalEmpate   = new bootstrap.Modal(document.querySelector('#modalEmpate'));

    document.querySelector('#btnCerrarVictoria').addEventListener('click', function() {cerrarModal(modalVictoria, btnRei);});
    document.querySelector('#btnXVictoria').addEventListener('click',      function() {cerrarModal(modalVictoria, btnRei);});
    document.querySelector('#btnCerrarDerrota').addEventListener('click',  function() {cerrarModal(modalDerrota,  btnRei);});
    document.querySelector('#btnXDerrota').addEventListener('click',       function() {cerrarModal(modalDerrota,  btnRei);});
    document.querySelector('#btnCerrarEmpate').addEventListener('click',   function() {cerrarModal(modalEmpate,   btnRei);});
    document.querySelector('#btnXEmpate').addEventListener('click',        function() {cerrarModal(modalEmpate,   btnRei);});
}

//Tabla de posiciones con localStorage

/*Busca el jugador en la tabla y guarda solo si es su primera victoria o supera su mejor tiempo*/
function guardarVictoria(nombre, tiempo)
{
    const tabla = JSON.parse(localStorage.getItem('cronoludico')) || [];
    let indice = -1;

    for (let i = 0; i < tabla.length; i++)
    {
        if (tabla[i].nombre === nombre) {indice = i; break;}
    }

    if (indice === -1) {tabla.push({ nombre: nombre, tiempo: tiempo, intentos: intentos });}
    else if (tiempo > tabla[indice].tiempo)
    {
        tabla[indice].tiempo   = tiempo;
        tabla[indice].intentos = intentos;
    }

    localStorage.setItem('cronoludico', JSON.stringify(tabla));
}

//Cronolúdico — Tabla de posiciones

document.addEventListener('DOMContentLoaded', function()
{
    const tablaCuerpo = document.querySelector('#tablaCuerpo');
    const filaVacia   = document.querySelector('#filaVacia');
    const btnBorrar   = document.querySelector('#btnBorrar');

    if (!tablaCuerpo) return;

    //Modal de confirmación para borrar la tabla
    document.body.insertAdjacentHTML('beforeend',
        '<div class="modal fade" id="modalBorrar" tabindex="-1" aria-labelledby="modalBorrarLabel" aria-hidden="true">' +
            '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">' +
                '<div class="modal-header bg-danger text-white">' +
                    '<h5 class="modal-title" id="modalBorrarLabel">⚠️ Borrar tabla</h5>' +
                    '<button type="button" class="btn-close btn-close-white" id="btnXBorrar" aria-label="Cerrar"></button>' +
                '</div>' +
                '<div class="modal-body">¿Seguro que querés borrar toda la tabla de posiciones? Esta acción no se puede deshacer.</div>' +
                '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-secondary" id="btnCancelarBorrar">Cancelar</button>' +
                    '<button type="button" class="btn btn-danger" id="btnConfirmarBorrar">Borrar</button>' +
                '</div>' +
            '</div></div>' +
        '</div>'
    );

    const modalBorrar = new bootstrap.Modal(document.querySelector('#modalBorrar'));

    document.querySelector('#btnXBorrar').addEventListener('click',      function() {cerrarModal(modalBorrar, btnBorrar);});
    document.querySelector('#btnCancelarBorrar').addEventListener('click', function() {cerrarModal(modalBorrar, btnBorrar);});

    /*Limpia las filas existentes y reconstruye la tabla desde localStorage
      ordena por mayor tiempo restante y destaca el primer puesto en amarillo*/
    function renderizarTabla()
    {
        const tabla = JSON.parse(localStorage.getItem('cronoludico')) || [];

        const filasBorrar = tablaCuerpo.querySelectorAll('tr:not(#filaVacia)');
        for (let i = 0; i < filasBorrar.length; i++) {filasBorrar[i].remove();}

        if (tabla.length === 0) {filaVacia.style.display = ''; return;}

        filaVacia.style.display = 'none';
        tabla.sort(function(a, b) {return b.tiempo - a.tiempo;});

        for (let i = 0; i < tabla.length; i++)
        {
            const fila     = document.createElement('tr');
            const pos      = document.createElement('th');
            const nombre   = document.createElement('td');
            const tiempo   = document.createElement('td');
            const intentos = document.createElement('td');

            pos.setAttribute('scope', 'row');
            pos.textContent      = i + 1;
            nombre.textContent   = tabla[i].nombre;
            tiempo.textContent   = tabla[i].tiempo + 's';
            intentos.textContent = tabla[i].intentos;

            if (i === 0) {fila.classList.add('table-warning');}

            fila.appendChild(pos);
            fila.appendChild(nombre);
            fila.appendChild(tiempo);
            fila.appendChild(intentos);
            tablaCuerpo.appendChild(fila);
        }
    }

    btnBorrar.addEventListener('click', function() {modalBorrar.show();});

    document.querySelector('#btnConfirmarBorrar').addEventListener('click', function()
    {
        localStorage.removeItem('cronoludico');
        cerrarModal(modalBorrar, btnBorrar);
        renderizarTabla();
    });

    renderizarTabla();
});