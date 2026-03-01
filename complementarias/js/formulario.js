//Formulario de contacto con validación en tiempo real y envío via Web3Forms

(function()
{
  'use strict';

  document.addEventListener('DOMContentLoaded', function()
  {
    /*Expresiones regulares para validar cada campo
      regexNombre acepta solo letras y espacios — formulario de contacto personal, sin números
      a diferencia del campo de nombre del juego que sí acepta alfanuméricos*/
    const regexNombre     = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{2,50}$/;
    const regexEmail      = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const regexComentario = /^[\s\S]{0,500}$/;

    /*Validación genérica: aplica setCustomValidity para integrar con Bootstrap was-validated
      si el valor es válido limpia el error, si no lo setea y actualiza el mensaje visible*/
    function validarCampo(input, regex, mensajeError)
    {
      if (regex.test(input.value.trim())) {input.setCustomValidity('');}
      else
      {
        input.setCustomValidity(mensajeError);
        input.nextElementSibling.nextElementSibling.textContent = mensajeError;
      }
    }

    /*Validación de fecha con rango de edad entre 13 y 122 años
      calcula la edad exacta considerando mes y día para no adelantar el cumpleaños*/
    function validarMayorDeEdad(input)
    {
      const valor = input.value;
      const anio = parseInt(valor.split('-')[0]);
      const mensaje = 'Por favor ingresá una fecha válida, debés tener entre 13 y 122 años';

      if (!valor || anio < 1000 || anio > 9999)
      {
        input.setCustomValidity(mensaje);
        input.nextElementSibling.nextElementSibling.textContent = mensaje;
        return;
      }

      const fechaNacimiento = new Date(valor);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {edad--;}

      if (edad >= 13 && edad <= 122) {input.setCustomValidity('');}
      else
      {
        input.setCustomValidity(mensaje);
        input.nextElementSibling.nextElementSibling.textContent = mensaje;
      }
    }

    //Referencias a los campos
    const inputNombre     = document.querySelector('#formGroupExampleInput');
    const inputApellido   = document.querySelector('#formGroupExampleInput2');
    const inputFecha      = document.querySelector('#formGroupExampleInput3');
    const inputEmail      = document.querySelector('#formGroupExampleInput4');
    const inputComentario = document.querySelector('#floatingTextarea');
    const botonEnviar     = document.querySelector('#form1 button[type="submit"]');

    /*Calcula los límites del campo fecha dinámicamente según la fecha actual
      evita hardcodear años que quedarían desactualizados*/
    const hoyLimite = new Date();
    inputFecha.min = new Date(hoyLimite.getFullYear() - 122, hoyLimite.getMonth(), hoyLimite.getDate()).toISOString().split('T')[0];
    inputFecha.max = new Date(hoyLimite.getFullYear() - 13,  hoyLimite.getMonth(), hoyLimite.getDate()).toISOString().split('T')[0];

    //Validación en tiempo real
    inputNombre.addEventListener('input',     function() {validarCampo(inputNombre,     regexNombre,     'Por favor ingresá un nombre válido (solo letras)');});
    inputApellido.addEventListener('input',   function() {validarCampo(inputApellido,   regexNombre,     'Por favor ingresá un apellido válido (solo letras)');});
    inputEmail.addEventListener('input',      function() {validarCampo(inputEmail,      regexEmail,      'Por favor ingresá un correo válido (ej: nombre@correo.com)');});
    inputComentario.addEventListener('input', function() {validarCampo(inputComentario, regexComentario, 'El comentario no puede superar los 500 caracteres');});

    inputFecha.addEventListener('input', function()
    {
      const valor = inputFecha.value;
      const anio = parseInt(valor.split('-')[0]);
      if (anio > 9999) {inputFecha.value = valor.substring(0, 4) + valor.substring(4);}
      validarMayorDeEdad(inputFecha);
    });

    //Modales generados dinámicamente — Bootstrap
    document.body.insertAdjacentHTML('beforeend',
      '<div class="modal fade" id="modalExito" tabindex="-1" aria-labelledby="modalExitoLabel" aria-hidden="true">' +
        '<div class="modal-dialog modal-dialog-centered">' +
          '<div class="modal-content">' +
            '<div class="modal-header bg-success text-white">' +
              '<h5 class="modal-title" id="modalExitoLabel">✔ Formulario enviado</h5>' +
              '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>' +
            '</div>' +
            '<div class="modal-body">' +
              '<p><strong>¡Muchas gracias!</strong><br>Tu mensaje fue enviado correctamente.</p>' +
              '<p>Si no recibís un correo en breve:</p>' +
              '<ul><li>revisá spam o correo no deseado</li><li>intentá nuevamente más tarde</li></ul>' +
            '</div>' +
            '<div class="modal-footer">' +
              '<button type="button" class="btn btn-success" data-bs-dismiss="modal" data-bs-autofocus="false">Aceptar</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="modal fade" id="modalError" tabindex="-1" aria-labelledby="modalErrorLabel" aria-hidden="true">' +
        '<div class="modal-dialog modal-dialog-centered">' +
          '<div class="modal-content">' +
            '<div class="modal-header bg-danger text-white">' +
              '<h5 class="modal-title" id="modalErrorLabel">✖ Error al enviar</h5>' +
              '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>' +
            '</div>' +
            '<div class="modal-body">Hubo un problema al enviar el formulario. Por favor intentá de nuevo más tarde.</div>' +
            '<div class="modal-footer">' +
              '<button type="button" class="btn btn-danger" data-bs-dismiss="modal" data-bs-autofocus="false">Cerrar</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    const modalExito = new bootstrap.Modal(document.querySelector('#modalExito'));
    const modalError = new bootstrap.Modal(document.querySelector('#modalError'));

    /*Al cerrar cada modal se devuelve el foco al botón de enviar
      evita la advertencia aria-hidden sobre descendientes con foco — accesibilidad WAI-ARIA*/
    document.querySelector('#modalExito').addEventListener('hidden.bs.modal', function() {botonEnviar.focus();});
    document.querySelector('#modalError').addEventListener('hidden.bs.modal', function() {botonEnviar.focus();});

    /*Submit: previene el envío nativo, valida todos los campos, y si pasa
      envía via fetch a Web3Forms mostrando el modal según el resultado — Bootstrap modal*/
    const formularios = document.querySelectorAll('.needs-validation');
    for (let i = 0; i < formularios.length; i++)
    {
      formularios[i].addEventListener('submit', function(event)
      {
        event.preventDefault();
        event.stopPropagation();

        validarCampo(inputNombre,     regexNombre,     'Por favor ingresá un nombre válido (solo letras)');
        validarCampo(inputApellido,   regexNombre,     'Por favor ingresá un apellido válido (solo letras)');
        validarMayorDeEdad(inputFecha);
        validarCampo(inputEmail,      regexEmail,      'Por favor ingresá un correo válido (ej: nombre@correo.com)');
        validarCampo(inputComentario, regexComentario, 'El comentario no puede superar los 500 caracteres');

        formularios[i].classList.add('was-validated');

        if (formularios[i].checkValidity())
        {
          const textoOriginal = botonEnviar.textContent;
          botonEnviar.textContent = 'Enviando...';
          botonEnviar.disabled = true;

          fetch('https://api.web3forms.com/submit', {method: 'POST', body: new FormData(formularios[i])})
            .then(function(response) {return response.json();})
            .then(function(data)
            {
              if (data.success)
              {
                modalExito.show();
                formularios[i].reset();
                formularios[i].classList.remove('was-validated');
              }
              else {modalError.show();}
            })
            .catch(function() {modalError.show();})
            .finally(function()
            {
              botonEnviar.textContent = textoOriginal;
              botonEnviar.disabled = false;
            });
        }
      }, false);
    }
  });
})();