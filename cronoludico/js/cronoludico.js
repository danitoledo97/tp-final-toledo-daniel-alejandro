//Cronolúdico — lógica del juego y tabla de posiciones

//Variables de estado del juego
let tiempoRestante = 30;
let marcadorValor  = 0;
let intentos       = 0;
let intervalo      = null;
let juegoActivo    = false;
let nombreActual   = '';
let ultimoClick    = 0;

//Referencias al DOM — el script está al final del body, el DOM ya existe al ejecutarse
//Referencias comunes a ambas páginas (index.html y tabla.html)
const tablaCuerpo = document.querySelector('#tablaCuerpo');
const filaVacia   = document.querySelector('#filaVacia');
const btnBorrar   = document.querySelector('#btnBorrar');

//Referencias exclusivas de index.html — null en tabla.html, se usan solo dentro de if (btnReg)
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

//Modal de borrar — común a ambas páginas, se crea siempre
const contenedorModalBorrar = document.createElement('div');
contenedorModalBorrar.innerHTML =
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
  '</div>';
document.body.appendChild(contenedorModalBorrar);

const modalBorrar        = new bootstrap.Modal(document.querySelector('#modalBorrar'));
const btnXBorrar         = document.querySelector('#btnXBorrar');
const btnCancelarBorrar  = document.querySelector('#btnCancelarBorrar');
const btnConfirmarBorrar = document.querySelector('#btnConfirmarBorrar');

/*Cierre manual de modales: espera hidden.bs.modal para mover el foco
  en ese momento Bootstrap ya terminó de cerrar y removió aria-hidden
  once:true evita que el listener se acumule en cada cierre*/
function cerrarModal(modal, destino)
{
  /*En mobile el toque pone el foco en el botón presionado dentro del modal
    blur() lo saca del modal antes de hide() para que Bootstrap no encuentre
    un descendiente con foco al poner aria-hidden durante la animación de cierre*/
  if (document.activeElement && modal._element.contains(document.activeElement))
  {
    document.activeElement.blur();
  }
  modal._element.addEventListener('hidden.bs.modal', function() {destino.focus();}, {once: true});
  modal.hide();
}

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

/*finDeRonda, verificarVictoria, empate y derrota reciben los modales como parámetros
  porque se declaran fuera del if(btnReg) pero los modales del juego se crean dentro*/
function finDeRonda(modales)
{
  btnMas.disabled   = true;
  btnMenos.disabled = true;
  btnJugar.disabled = false;
}

function verificarVictoria(modales)
{
  if (marcadorValor !== 0) {return;}
  if (tiempoRestante <= 0) {empate(modales); return;}

  clearInterval(intervalo);
  clearTimeout(window.azar);
  juegoActivo = false;

  divResultado.textContent  = '¡Victoria! Tiempo restante: ' + tiempoRestante + 's';
  mensajeEstado.textContent = '¡Lograste permanecer en el presente!';
  document.querySelector('#modalVictoriaBody').textContent = '¡Lograste permanecer en el presente! Tiempo restante: ' + tiempoRestante + 's.';

  /*El modal de victoria se abre con .show() directo sin mover el foco al abrir
    mover el foco dentro del modal mientras Bootstrap gestiona aria-hidden causa la advertencia
    el foco se devuelve a btnRei solo al cerrar, vía hidden.bs.modal en cerrarModal*/
  guardarVictoria(nombreActual, tiempoRestante);
  finDeRonda(modales);
  modales.victoria.show();
}

function empate(modales)
{
  divResultado.textContent  = '¡EMPATE ÉPICO! El tiempo y el presente colisionaron.';
  mensajeEstado.textContent = 'Un instante legendario. No se registra en la tabla.';
  modales.empate.show();
  finDeRonda(modales);
}

function derrota(modales)
{
  divResultado.textContent  = 'Derrota. El tiempo venció al presente.';
  mensajeEstado.textContent = '';
  document.querySelector('#modalDerrotaBody').textContent = 'El tiempo venció al presente. No lograste permanecer en el 0.';
  modales.derrota.show();
  finDeRonda(modales);
}

/*Azar automático: setTimeout recursivo fijo de 3 segundos
  cambia el valor y el signo del marcador sin aviso para mantener la tensión
  para ajustar la dificultad: modificar el delay en programarAzar(), los valores
  del marcador (actualmente ±7 a ±14) y el cooldown de los botones (actualmente 300ms)*/
function programarAzar(modales)
{
  window.azar = setTimeout(function()
  {
    if (!juegoActivo) {return;}

    let signo = 1;
    if (Math.random() >= 0.5) {signo = -1;}
    marcadorValor = signo * (Math.floor(Math.random() * 8) + 7);
    if (marcadorValor > 15)  {marcadorValor =  30;}
    if (marcadorValor < -15) {marcadorValor = -30;}

    mensajeEstado.textContent = 'Llegá exactamente a 0.';
    actualizarVista();
    verificarVictoria(modales);
    programarAzar(modales);
  }, 3000);
}

/*Busca el jugador en la tabla y guarda solo si es su primera victoria o supera su mejor tiempo*/
function guardarVictoria(nombre, tiempo)
{
  const tabla = JSON.parse(localStorage.getItem('cronoludico')) || [];
  let indice  = -1;

  for (let i = 0; i < tabla.length; i++)
  {
    if (tabla[i].nombre === nombre) {indice = i; break;}
  }

  if (indice === -1) {tabla.push({nombre: nombre, tiempo: tiempo, intentos: intentos});}
  else if (tiempo > tabla[indice].tiempo)
  {
    tabla[indice].tiempo   = tiempo;
    tabla[indice].intentos = intentos;
  }

  localStorage.setItem('cronoludico', JSON.stringify(tabla));
}

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

(function()
{
  'use strict';

  //Listeners del modal de borrar — comunes a ambas páginas
  btnXBorrar.addEventListener('click',        function() {cerrarModal(modalBorrar, btnBorrar);});
  btnCancelarBorrar.addEventListener('click', function() {cerrarModal(modalBorrar, btnBorrar);});

  btnConfirmarBorrar.addEventListener('click', function()
  {
    localStorage.removeItem('cronoludico');
    modalBorrar._element.addEventListener('hidden.bs.modal', function()
    {
      btnBorrar.focus();
      renderizarTabla();
    }, {once: true});
    modalBorrar.hide();
  });

  if (tablaCuerpo) {renderizarTabla();}
  if (btnBorrar)   {btnBorrar.addEventListener('click', function() {modalBorrar.show();});}

  //Modales y lógica del juego — solo en index.html donde btnReg existe
  if (btnReg)
  {
    const contenedorModalesJuego = document.createElement('div');
    contenedorModalesJuego.innerHTML =
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
      '</div>';
    document.body.appendChild(contenedorModalesJuego);

    const modalVictoria     = new bootstrap.Modal(document.querySelector('#modalVictoria'));
    const modalDerrota      = new bootstrap.Modal(document.querySelector('#modalDerrota'));
    const modalEmpate       = new bootstrap.Modal(document.querySelector('#modalEmpate'));
    const btnXVictoria      = document.querySelector('#btnXVictoria');
    const btnCerrarVictoria = document.querySelector('#btnCerrarVictoria');
    const btnXDerrota       = document.querySelector('#btnXDerrota');
    const btnCerrarDerrota  = document.querySelector('#btnCerrarDerrota');
    const btnXEmpate        = document.querySelector('#btnXEmpate');
    const btnCerrarEmpate   = document.querySelector('#btnCerrarEmpate');

    /*Objeto modales: agrupa las referencias para pasarlas como parámetro a las funciones
      que se declaran fuera del if(btnReg) y no tienen acceso directo a estas constantes*/
    const modales = {
      victoria:          modalVictoria,
      derrota:           modalDerrota,
      empate:            modalEmpate,
      btnCerrarVictoria: btnCerrarVictoria,
      btnCerrarDerrota:  btnCerrarDerrota,
      btnCerrarEmpate:   btnCerrarEmpate
    };

    btnXVictoria.addEventListener('click',      function() {cerrarModal(modalVictoria, btnRei);});
    btnCerrarVictoria.addEventListener('click', function() {cerrarModal(modalVictoria, btnRei);});
    btnXDerrota.addEventListener('click',       function() {cerrarModal(modalDerrota,  btnRei);});
    btnCerrarDerrota.addEventListener('click',  function() {cerrarModal(modalDerrota,  btnRei);});
    btnXEmpate.addEventListener('click',        function() {cerrarModal(modalEmpate,   btnRei);});
    btnCerrarEmpate.addEventListener('click',   function() {cerrarModal(modalEmpate,   btnRei);});

    //Registro del jugador
    btnReg.addEventListener('click', function(e)
    {
      e.preventDefault();

      /*\s* al inicio y al final tolera espacios sin necesitar trim()*/
      const regexNombre = /^[\s]*[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]{3,30}[\s]*$/;

      if (!regexNombre.test(campoNom.value))
      {
        campoNom.classList.add('is-invalid');
        return false;
      }

      campoNom.classList.remove('is-invalid');
      campoNom.classList.add('is-valid');
      campoNom.disabled = true;

      nombreActual      = campoNom.value;
      btnReg.disabled   = true;
      btnJugar.disabled = false;
      mensajeEstado.textContent = 'Presioná Iniciar para comenzar.';
    });

    //Inicio del juego
    btnJugar.addEventListener('click', function(e)
    {
      e.preventDefault();

      intentos++;
      tiempoRestante = 30;
      let signo = 1;
      if (Math.random() >= 0.5) {signo = -1;}
      marcadorValor = signo * (Math.floor(Math.random() * 8) + 7);
      juegoActivo   = true;

      btnJugar.disabled = true;
      btnMas.disabled   = false;
      btnMenos.disabled = false;

      divResultado.textContent  = '';
      mensajeEstado.textContent = 'Llegá exactamente a 0.';

      actualizarVista();
      programarAzar(modales);

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
          if (marcadorValor === 0) {empate(modales);} else {derrota(modales);}
        }
      }, 1000);
    });

    //Botones + y -
    /*Cooldown de 300ms — si clickea más rápido el azar se acelera*/
    btnMas.addEventListener('click', function(e)
    {
      e.preventDefault();
      if (!juegoActivo) {return;}

      const ahora          = Date.now();
      const intervaloClick = ahora - ultimoClick;
      if (intervaloClick < 300) {return;}
      ultimoClick = ahora;

      if (marcadorValor >= 15) {mensajeEstado.textContent = '¡Tope del futuro alcanzado!'; return;}

      mensajeEstado.textContent = 'Llegá exactamente a 0.';
      marcadorValor++;
      actualizarVista();
      verificarVictoria(modales);
    });

    btnMenos.addEventListener('click', function(e)
    {
      e.preventDefault();
      if (!juegoActivo) {return;}

      const ahora          = Date.now();
      const intervaloClick = ahora - ultimoClick;
      if (intervaloClick < 300) {return;}
      ultimoClick = ahora;

      if (marcadorValor <= -15) {mensajeEstado.textContent = '¡Tope del pasado alcanzado!'; return;}

      mensajeEstado.textContent = 'Llegá exactamente a 0.';
      marcadorValor--;
      actualizarVista();
      verificarVictoria(modales);
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

      campoNom.value    = '';
      campoNom.disabled = false;
      campoNom.classList.remove('is-valid', 'is-invalid');
      btnReg.disabled   = false;
      btnJugar.disabled = true;
      btnMas.disabled   = true;
      btnMenos.disabled = true;
      grupoRegistro.style.display = '';
    });
  }
})();