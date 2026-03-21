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

  /*Article: animación — IntersectionObserver + GSAP
    IntersectionObserver detecta cuando el article entra en el viewport (threshold 0.2 = 20% visible)
    y delega la animación a GSAP para controlar la curva de movimiento — combinación de ambas librerías
    unobserve detiene la observación una vez animado para no repetir el efecto*/
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

  /*GSAP set: establece el estado inicial oculto e inclinado antes de que sean visibles
    el observer dispara gsap.to para animarlos al entrar en pantalla*/
  for (let i = 0; i < articles.length; i++)
  {
    gsap.set(articles[i], {opacity: 0, rotateX: -6, y: 24, scale: 0.985, transformOrigin: 'top center', transformPerspective: 900});
    observer.observe(articles[i]);
  }

  /*Efecto lux / overlay
    actualiza las variables CSS --x e --y con la posición del cursor dentro del contenedor
    el CSS usa esas variables para mover el gradiente radial del overlay de iluminación*/
  for (let i = 0; i < contenedoresLux.length; i++)
  {
    contenedoresLux[i].addEventListener('mousemove', function(e)
    {
      const rect = contenedoresLux[i].getBoundingClientRect();
      contenedoresLux[i].style.setProperty('--x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      contenedoresLux[i].style.setProperty('--y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  }

  /*Mouse interactivo — rastro de cursor
    desactiva el rastro cuando el cursor está sobre elementos interactivos
    crea una partícula div en la posición del cursor que se autodestruye en 400ms*/
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

  /*Footer y scroll con tope
    IntersectionObserver para el footer: activa la animación piano y la vibración
    cuando el footer entra en el viewport por primera vez*/
  /*footerObserver observa un único elemento — entries[0] es suficiente sin necesidad de for*/
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

  /*Activa la vibración al intentar scrollear más allá del final de la página
    passive: true mejora el rendimiento al indicar que el evento no llama preventDefault*/
  window.addEventListener('wheel', function(e)
  {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5 && e.deltaY > 0)
    {
      contenedor.classList.add('vibracion-activa');
      clearTimeout(window.vibeTimer);
      window.vibeTimer = setTimeout(function() {contenedor.classList.remove('vibracion-activa');}, 20);
    }
  }, {passive: true});

  //Cubo vertical — carousel 3D
  if (carouselEl && fondo)
  {
    carouselEl.addEventListener('slid.bs.carousel', moverCilindro);
    moverCilindro();
  }

  /*Tema: muestra el tema activo al cargar y agrega listeners a los botones del dropdown — Bootstrap*/
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

  /*Imágenes interactivas con hover — Vanilla Tilt
    reemplaza el cálculo manual de rotateX/rotateY con mousemove/mouseleave
    perspective, max y speed replican los valores del efecto parallax 3D original
    el if verifica que la librería esté cargada y que haya elementos en la página antes de inicializar
    para agregar tilt a nuevas imágenes: usar clase imgs-marco o imgs-selfie en el contenedor
    para excluir una imagen del efecto: agregar clase no-tilt al contenedor (ej: imgs-selfie no-tilt)*/
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
})();