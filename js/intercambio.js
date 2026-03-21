/*Selector de tema claro/oscuro/auto*/
/*Bootstrap: lee y aplica el atributo data-bs-theme que Bootstrap usa para cambiar colores globales*/

//Referencias al DOM — el script está al final del body, el DOM ya existe al ejecutarse
const navbar           = document.querySelector('.navbar');
const articles         = document.querySelectorAll('article');
const contenedoresLux  = document.querySelectorAll('.interactive-image-container');
const elementosTilt    = document.querySelectorAll('.imgs-marco:not(.no-tilt), .imgs-selfie:not(.no-tilt)');
const footer           = document.querySelector('footer');
const contenedor       = document.querySelector('#contenedor');
const carouselEl       = document.querySelector('#carouselExampleCaptions');
const fondo            = document.querySelector('#fondo-dinamico');
const interactiveElements = 'a, button, .btn, .nav-link, select, input, textarea, .interactive-image-container, .imgs-marco, .imgs-selfie, img, .navbar, #modo';

//Variables de estado
let lastScroll  = 0;
let isOverLink  = false;

/*Lee y guarda el tema elegido en localStorage para recordarlo entre sesiones*/
function getStoredTheme() {return localStorage.getItem('theme');}
function setStoredTheme(theme) {localStorage.setItem('theme', theme);}

/*Determina el tema a usar: primero busca en localStorage, si no hay usa la preferencia del sistema operativo*/
function getPreferredTheme()
{
  const storedTheme = getStoredTheme();
  if (storedTheme) {return storedTheme;}
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {return 'dark';}
  return 'light';
}

/*Aplica el tema al documento cambiando el atributo data-bs-theme que Bootstrap lee para cambiar colores*/
function setTheme(theme)
{
  if (theme === 'auto')
  {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches)
    {document.documentElement.setAttribute('data-bs-theme', 'dark');}
    else {document.documentElement.setAttribute('data-bs-theme', 'light');}
  }
  else {document.documentElement.setAttribute('data-bs-theme', theme);}
}

/*Marca visualmente el botón activo en el dropdown y actualiza el ícono del selector*/
function showActiveTheme(theme, focus)
{
  if (focus === undefined) {focus = false;}

  const themeSwitcher     = document.querySelector('#bd-theme');
  if (!themeSwitcher) {return;}

  const themeSwitcherText = document.querySelector('#bd-theme-text');
  const activeThemeIcon   = document.querySelector('.theme-icon-active use');
  const btnToActive       = document.querySelector('[data-bs-theme-value="' + theme + '"]');

  if (!btnToActive || !activeThemeIcon || !themeSwitcherText) {return;}

  const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href');

  const botonesTheme = document.querySelectorAll('[data-bs-theme-value]');
  for (let i = 0; i < botonesTheme.length; i++)
  {
    botonesTheme[i].classList.remove('active');
    botonesTheme[i].setAttribute('aria-pressed', 'false');
  }

  btnToActive.classList.add('active');
  btnToActive.setAttribute('aria-pressed', 'true');
  activeThemeIcon.setAttribute('href', svgOfActiveBtn);
  const themeSwitcherLabel = themeSwitcherText.textContent + ' (' + btnToActive.dataset.bsThemeValue + ')';
  themeSwitcher.setAttribute('aria-label', themeSwitcherLabel);

  if (focus) {themeSwitcher.focus();}
}

/*Rota el cilindro 3D al ángulo correspondiente al slide activo*/
function moverCilindro()
{
  if (!carouselEl || !fondo) {return;}

  const inner    = carouselEl.querySelector('.carousel-inner');
  const items    = carouselEl.querySelectorAll('.carousel-item');
  const activo   = carouselEl.querySelector('.carousel-item.active');
  if (!activo) {return;}

  let indice = 0;
  for (let i = 0; i < items.length; i++)
  {
    if (items[i] === activo) {indice = i; break;}
  }

  const grados = indice * (360 / 7);
  if (inner) {inner.style.transform = 'rotateY(' + (-grados) + 'deg)';}

  const imgInside = activo.querySelector('img');
  if (imgInside) {fondo.style.backgroundImage = 'url(\'' + imgInside.src + '\')';}
}

/*Inicializa Vanilla Tilt en desktop*/
function initVanillaTilt()
{
  if (typeof VanillaTilt !== 'undefined' && elementosTilt.length > 0)
  {
    VanillaTilt.init(elementosTilt,
    {
      max: 15,
      speed: 600,
      perspective: 1000,
      scale: 1.02,
      transition: true,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)'
    });
  }
}

(function()
{
  'use strict';

  setTheme(getPreferredTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function()
  {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {setTheme(getPreferredTheme());}
  });

  if (navbar)
  {
    window.addEventListener('scroll', function()
    {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll && currentScroll > 50) {navbar.classList.add('navbar-hidden');}
      else {navbar.classList.remove('navbar-hidden');}
      lastScroll = currentScroll;
    });
  }

  const observer = new IntersectionObserver(function(entries)
  {
    for (let i = 0; i < entries.length; i++)
    {
      if (entries[i].isIntersecting)
      {
        gsap.to(entries[i].target,
        {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out'
        });
        observer.unobserve(entries[i].target);
      }
    }
  }, {threshold: 0.2});

  for (let i = 0; i < articles.length; i++)
  {
    gsap.set(articles[i], {opacity: 0, rotateX: -6, y: 24, scale: 0.985, transformOrigin: 'top center', transformPerspective: 900});
    observer.observe(articles[i]);
  }

  /*Efecto lux / overlay*/
  for (let i = 0; i < contenedoresLux.length; i++)
  {
    contenedoresLux[i].addEventListener('mousemove', function(e)
    {
      const rect = contenedoresLux[i].getBoundingClientRect();
      contenedoresLux[i].style.setProperty('--x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      contenedoresLux[i].style.setProperty('--y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  }

  document.addEventListener('mouseover', function(e)
  {if (e.target.closest(interactiveElements)) {isOverLink = true;}});

  document.addEventListener('mouseout', function(e)
  {if (e.target.closest(interactiveElements)) {isOverLink = false;}});

  document.addEventListener('mousemove', function(e)
  {
    if (isOverLink) {return;}
    const trail     = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = e.clientX + 'px';
    trail.style.top  = e.clientY + 'px';
    document.body.appendChild(trail);
    setTimeout(function() {trail.remove();}, 400);
  });

  const footerObserver = new IntersectionObserver(function(entries)
  {
    if (entries[0].isIntersecting)
    {
      footer.classList.add('piano-visible');
      contenedor.classList.add('vibracion-activa');
      setTimeout(function() {contenedor.classList.remove('vibracion-activa');}, 150);
    }
  }, {threshold: 0.2});

  footerObserver.observe(footer);

  /*Vibración desktop*/
  window.addEventListener('wheel', function(e)
  {
    const doc     = document.documentElement;
    const alFinal = doc.scrollHeight - doc.scrollTop - doc.clientHeight <= 5;
    if (alFinal && e.deltaY > 0)
    {
      contenedor.classList.add('vibracion-activa');
      clearTimeout(window.vibeTimer);
      window.vibeTimer = setTimeout(function() {contenedor.classList.remove('vibracion-activa');}, 200);
    }
  }, {passive: true});

  /*Vibración Android*/
  var tocandoPantalla = false;
  var scrollEnFondo   = false;

  function estaAlFinal()
  {
    var doc = document.documentElement;
    return doc.scrollHeight - doc.scrollTop - doc.clientHeight <= 2;
  }

  function activarVibracion()
  {
    if (scrollEnFondo) {return;}
    scrollEnFondo = true;
    contenedor.classList.add('vibracion-activa');
    clearTimeout(window.vibeTimerTouch);
    window.vibeTimerTouch = setTimeout(function()
    {
      contenedor.classList.remove('vibracion-activa');
      scrollEnFondo = false;
    }, 200);
  }

  window.addEventListener('touchstart', function()
  {
    tocandoPantalla = true;
    scrollEnFondo   = false;
  }, {passive: true});

  window.addEventListener('touchend', function()
  {
    tocandoPantalla = false;
    setTimeout(function()
    {
      if (estaAlFinal()) {activarVibracion();}
    }, 80);
  }, {passive: true});

  window.addEventListener('scroll', function()
  {
    if (!tocandoPantalla) {return;}
    if (estaAlFinal()) {activarVibracion();}
    else {scrollEnFondo = false;}
  }, {passive: true});

  if (carouselEl && fondo)
  {
    carouselEl.addEventListener('slid.bs.carousel', moverCilindro);
    moverCilindro();
  }

  showActiveTheme(getPreferredTheme());

  const toggles = document.querySelectorAll('[data-bs-theme-value]');
  for (let i = 0; i < toggles.length; i++)
  {
    toggles[i].addEventListener('click', function()
    {
      const theme = toggles[i].getAttribute('data-bs-theme-value');
      setStoredTheme(theme);
      setTheme(theme);
      showActiveTheme(theme, true);
    });
  }

  /*Tilt por giroscopio (DeviceOrientation) en móvil
    Android: funciona directo en HTTPS sin pedir permiso
    iOS: requiere permiso explícito del usuario — se maneja más abajo
    beta  = inclinación adelante/atrás  → rotateX
    gamma = inclinación izquierda/derecha → rotateY
    Se calibra al primer evento para usar la posición inicial del teléfono como neutro
    en lugar de requerir que el teléfono esté perfectamente horizontal*/
  var esTactil    = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  var tieneGiro   = (typeof DeviceOrientationEvent !== 'undefined');
  var betaBase    = null;  // posición inicial de beta  (calibración)
  var gammaBase   = null;  // posición inicial de gamma (calibración)
  var MAX_TILT    = 15;    // grados máximos — mismo valor que Vanilla Tilt
  var ESCALA_GIRO = 0.4;   // sensibilidad: cuántos grados de teléfono = 1 grado de tilt

  /*Clamp: limita un valor entre min y max*/
  function clamp(val, min, max)
  {
    return Math.min(Math.max(val, min), max);
  }

  /*Handler del giroscopio — se ejecuta en cada cambio de orientación del teléfono*/
  function onDeviceOrientation(e)
  {
    if (e.beta === null || e.gamma === null) {return;}
    if (elementosTilt.length === 0) {return;}

    /*Calibración: el primer evento establece la posición neutra
      así el efecto funciona desde cualquier ángulo de sujeción del teléfono*/
    if (betaBase === null)
    {
      betaBase  = e.beta;
      gammaBase = e.gamma;
      return;
    }

    /*Delta respecto a la posición inicial calibrada*/
    var deltaBeta  = e.beta  - betaBase;
    var deltaGamma = e.gamma - gammaBase;

    /*Convierte los grados del teléfono a grados de tilt — escalado y limitado*/
    var rotX = clamp(deltaBeta  * ESCALA_GIRO, -MAX_TILT, MAX_TILT);
    var rotY = clamp(deltaGamma * ESCALA_GIRO, -MAX_TILT, MAX_TILT);

    /*Actualiza las variables CSS en todos los elementos tilt
      misma técnica que el efecto lux: JS actualiza variables, CSS aplica el transform*/
    for (var i = 0; i < elementosTilt.length; i++)
    {
      elementosTilt[i].style.setProperty('--tilt-x', rotX + 'deg');
      elementosTilt[i].style.setProperty('--tilt-y', rotY + 'deg');
    }
  }

  /*Recalibra la posición neutra al volver a la página
    evita saltos bruscos si el teléfono cambió de posición mientras la página estaba en segundo plano*/
  document.addEventListener('visibilitychange', function()
  {
    if (!document.hidden)
    {
      betaBase  = null;
      gammaBase = null;
    }
  });

  if (esTactil && tieneGiro && elementosTilt.length > 0)
  {
    /*iOS 13+: DeviceOrientationEvent.requestPermission() es requerido
      Se muestra un botón de activación la primera vez
      Android: window.DeviceOrientationEvent.requestPermission no existe → rama else directa*/
    if (typeof DeviceOrientationEvent.requestPermission === 'function')
    {
      /*iOS: crear botón de permiso visible para el usuario*/
      var btnPermiso      = document.createElement('button');
      btnPermiso.textContent = '🌀 Activar efecto 3D';
      btnPermiso.style.cssText = (
        'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
        'z-index:9999;padding:10px 20px;border-radius:2rem;border:none;' +
        'background:rgba(168,85,247,0.9);color:#fff;font-size:0.9rem;cursor:pointer;'
      );
      document.body.appendChild(btnPermiso);

      btnPermiso.addEventListener('click', function()
      {
        DeviceOrientationEvent.requestPermission().then(function(respuesta)
        {
          if (respuesta === 'granted')
          {
            window.addEventListener('deviceorientation', onDeviceOrientation);
          }
          btnPermiso.remove();
        }).catch(function() {btnPermiso.remove();});
      });
    }
    else
    {
      /*Android: activa directo sin pedir permiso*/
      window.addEventListener('deviceorientation', onDeviceOrientation);
    }
  }

  /*Desktop: Vanilla Tilt cargado dinámicamente — no se carga en móvil
    Eliminar el tag <script> de vanilla-tilt del HTML en las páginas con imágenes secundarias*/
  if (!esTactil && elementosTilt.length > 0)
  {
    var scriptTilt    = document.createElement('script');
    scriptTilt.src    = 'https://cdn.jsdelivr.net/npm/vanilla-tilt@1.8.1/dist/vanilla-tilt.min.js';
    scriptTilt.onload = function() {initVanillaTilt();};
    document.head.appendChild(scriptTilt);
  }

})();