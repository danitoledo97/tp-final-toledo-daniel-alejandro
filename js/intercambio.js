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

  /*Detección de dispositivo táctil
    En táctil: no se inicializa Vanilla Tilt para evitar conflictos con el transform del CSS
    En desktop: Vanilla Tilt maneja el efecto con mousemove normalmente*/
  var esTactil = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (!esTactil && typeof VanillaTilt !== 'undefined' && elementosTilt.length > 0)
  {
    /*Desktop: Vanilla Tilt con hover real*/
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
  else if (esTactil && elementosTilt.length > 0)
  {
    /*Táctil: tilt direccional por touchstart — sin depender de touchmove
      touchstart siempre se dispara incluso cuando el browser toma el scroll
      lee la posición del toque en el momento exacto del tap y aplica el tilt
      correspondiente a ese punto, igual que el efecto lux con getBoundingClientRect()
      El :active del CSS garantiza el feedback visual inmediato
      y el JS agrega la dirección del tilt según el punto de contacto*/
    for (var t = 0; t < elementosTilt.length; t++)
    {
      (function(el)
      {
        var MAX_TILT = 12;

        el.addEventListener('touchstart', function(e)
        {
          /*getBoundingClientRect() en touchstart: coordenadas frescas del elemento
            en el viewport en el momento exacto del tap — misma técnica que el lux*/
          var rect  = el.getBoundingClientRect();
          var touch = e.touches[0];

          var px = (touch.clientX - rect.left)  / rect.width  - 0.5;
          var py = (touch.clientY - rect.top)   / rect.height - 0.5;

          var rotY =  px * MAX_TILT * 2;
          var rotX = -py * MAX_TILT * 2;

          /*Actualiza las variables CSS que usa el :active
            el :active ya aplica el scale, el JS agrega la rotación direccional*/
          el.style.setProperty('--tilt-x', rotX + 'deg');
          el.style.setProperty('--tilt-y', rotY + 'deg');
          el.style.setProperty('--tilt-scale', '1.03');
        }, {passive: true});

        function resetTilt()
        {
          el.style.setProperty('--tilt-x', '0deg');
          el.style.setProperty('--tilt-y', '0deg');
          el.style.setProperty('--tilt-scale', '1');
        }

        el.addEventListener('touchend',    resetTilt, {passive: true});
        el.addEventListener('touchcancel', resetTilt, {passive: true});

      })(elementosTilt[t]);
    }
  }

})();