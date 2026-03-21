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

  /*Quita la clase active de todos los botones y la pone solo en el seleccionado — Bootstrap*/
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

/*Rota el cilindro 3D al ángulo correspondiente al slide activo
  y actualiza la imagen de fondo dinámico con la imagen del slide — Bootstrap carousel*/
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

/*IIFE: función que se ejecuta sola al cargar, evita contaminar el scope global con sus variables*/
(function()
{
  'use strict';

  //Tema: aplica al cargar y escucha cambios del sistema
  setTheme(getPreferredTheme());

  /*Detecta cambios en la preferencia del sistema operativo en tiempo real
    solo actúa si el usuario no eligió un tema manualmente*/
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function()
  {
    const storedTheme = getStoredTheme();
    if (storedTheme !== 'light' && storedTheme !== 'dark') {setTheme(getPreferredTheme());}
  });

  //Barra inteligente — oculta la navbar al scrollear hacia abajo y la muestra al volver
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

  /*Article: animación — IntersectionObserver + GSAP*/
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

  /*Efecto lux / overlay — actualiza --x e --y con la posición del cursor*/
  for (let i = 0; i < contenedoresLux.length; i++)
  {
    contenedoresLux[i].addEventListener('mousemove', function(e)
    {
      const rect = contenedoresLux[i].getBoundingClientRect();
      contenedoresLux[i].style.setProperty('--x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      contenedoresLux[i].style.setProperty('--y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  }

  /*Rastro de cursor*/
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

  /*Footer: animación piano + vibración al entrar en viewport*/
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

  /*Vibración en desktop — evento wheel*/
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

  /*Vibración en Android — usa scroll + touchend
    En Android el evento wheel no se dispara en táctil.
    document.documentElement.scrollTop es más fiable que window.scrollY durante
    el scroll inercial nativo de Android, por eso se usa scrollHeight - scrollTop - clientHeight.
    tocandoPantalla evita falsos positivos del scroll inercial post-touchend.
    scrollEnFondo previene que la vibración se dispare múltiples veces consecutivas.*/
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
    /*Pequeño delay para capturar el final del scroll inercial*/
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

  //Cubo vertical — carousel 3D
  if (carouselEl && fondo)
  {
    carouselEl.addEventListener('slid.bs.carousel', moverCilindro);
    moverCilindro();
  }

  /*Tema: muestra el tema activo al cargar y agrega listeners — Bootstrap*/
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

  /*Imágenes interactivas — Vanilla Tilt en desktop*/
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

  /*Tilt táctil en Android — replica el patrón exacto del efecto lux:
    getBoundingClientRect() dentro del handler touchmove para obtener coordenadas
    frescas relativas al viewport en cada evento, igual que hace el efecto de luz
    en las imágenes cabecera con mousemove.
    touch.clientX/Y son coordenadas del viewport — misma referencia que rect.left/top
    por lo que el cálculo es idéntico al del lux y respeta el punto exacto del toque.*/
  var esTactil = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (esTactil && elementosTilt.length > 0)
  {
    for (var t = 0; t < elementosTilt.length; t++)
    {
      (function(el)
      {
        var MAX_TILT = 15;
        var SCALE    = 1.02;

        el.addEventListener('touchmove', function(e)
        {
          /*getBoundingClientRect() en cada evento: misma técnica que el efecto lux
            garantiza coordenadas correctas independientemente del scroll acumulado*/
          var rect  = el.getBoundingClientRect();
          var touch = e.touches[0];

          /*Normalización idéntica al efecto lux pero centrada en 0:
            lux usa (clientX - rect.left) / width * 100 para porcentaje CSS
            tilt usa la misma fórmula pero resta 0.5 para obtener rango -0.5 a +0.5*/
          var px = (touch.clientX - rect.left)  / rect.width  - 0.5;
          var py = (touch.clientY - rect.top)   / rect.height - 0.5;

          /*Conversión a grados — mismo cálculo interno de Vanilla Tilt:
            toque en borde derecho (px=+0.5) → rotateY positivo → inclina hacia derecha
            toque en borde superior (py=-0.5) → rotateX positivo → inclina hacia arriba*/
          var rotY =  px * MAX_TILT * 2;
          var rotX = -py * MAX_TILT * 2;

          el.style.transition = 'transform 0.1s ease';
          el.style.transform  = 'perspective(1000px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(' + SCALE + ')';
        }, {passive: true});

        function resetTilt()
        {
          el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
          el.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        }

        el.addEventListener('touchend',    resetTilt, {passive: true});
        el.addEventListener('touchcancel', resetTilt, {passive: true});

      })(elementosTilt[t]);
    }
  }

})();