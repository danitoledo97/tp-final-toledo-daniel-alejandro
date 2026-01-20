(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme')
  const setStoredTheme = theme => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const setTheme = theme => {
    if (theme === 'auto') {
      document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  setTheme(getPreferredTheme())

  const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('#bd-theme')

    if (!themeSwitcher) {
      return
    }

    const themeSwitcherText = document.querySelector('#bd-theme-text')
    const activeThemeIcon = document.querySelector('.theme-icon-active use')
    const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
    
    // Verificación para evitar errores si los elementos no existen
    if (!btnToActive || !activeThemeIcon || !themeSwitcherText) return;

    const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href')

    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.classList.remove('active')
      element.setAttribute('aria-pressed', 'false')
    })

    btnToActive.classList.add('active')
    btnToActive.setAttribute('aria-pressed', 'true')
    activeThemeIcon.setAttribute('href', svgOfActiveBtn)
    const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`
    themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)

    if (focus) {
      themeSwitcher.focus()
    }
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme())
    }
  })

  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme())

    document.querySelectorAll('[data-bs-theme-value]')
      .forEach(toggle => {
        toggle.addEventListener('click', () => {
          const theme = toggle.getAttribute('data-bs-theme-value')
          setStoredTheme(theme)
          setTheme(theme)
          showActiveTheme(theme, true)
        })
      })
  })
})()

/*modo oscuro*/

let lastScroll = 0;
const navbar = document.querySelector(".navbar");

if (navbar) {
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 50) 
    {
      navbar.classList.add("navbar-hidden");
    } 
    
    else 
    {
      navbar.classList.remove("navbar-hidden");
    }

    lastScroll = currentScroll;
  });
}

/*barra inteligente*/

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, {
  threshold: 0.2
});

document.querySelectorAll("article").forEach(article => {
  observer.observe(article);
});

/*cubo vértical*/

document.addEventListener('DOMContentLoaded', function() {
    // Cambiado getElementById por querySelector
    const carouselEl = document.querySelector('#carouselExampleCaptions');
    const fondo = document.querySelector('#fondo-dinamico');

    // Esta condición IF evita el error "Cannot read properties of null" 
    // cuando no estás en la página del index.
    if (carouselEl && fondo) {
        const inner = carouselEl.querySelector('.carousel-inner');
        const items = carouselEl.querySelectorAll('.carousel-item');

        function moverCilindro() {
            const activo = carouselEl.querySelector('.carousel-item.active');
            if (!activo) return;

            const indice = Array.from(items).indexOf(activo);
            
            // Cada slide son 51.42 grados (360/7)
            const grados = indice * (360 / 7);
            
            // Rotamos el cilindro completo
            if (inner) {
                inner.style.transform = `rotateY(${-grados}deg)`;
            }
            
            // Actualizamos fondo dinámico
            const imgInside = activo.querySelector('img');
            if (imgInside) {
                fondo.style.backgroundImage = `url('${imgInside.src}')`;
            }
        }

        // Escuchamos a Bootstrap cuando cambia de slide
        carouselEl.addEventListener('slid.bs.carousel', moverCilindro);

        // Inicio manual
        moverCilindro();
    }
});

/*Carrusel 3D*/