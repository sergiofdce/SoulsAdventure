// Homepage.js - Gestiona las animaciones y el carrusel de la página de inicio

document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos DOM
    const newGameBtn = document.getElementById("new-game-btn");
    const howToPlayBtn = document.getElementById("how-to-play-btn");
    const registerForm = document.getElementById("register-form");
    const howToPlay = document.getElementById("how-to-play");
    const backFromRegister = document.getElementById("back-from-register");
    const backFromHowto = document.getElementById("back-from-howto");
    const particlesContainer = document.getElementById("particles-container");
    const startContainer = document.querySelector(".start-container");

    // Mostrar el formulario de registro
    newGameBtn.addEventListener("click", () => {
        animateMenuOut();
        setTimeout(() => {
            registerForm.classList.remove("hidden");
            registerForm.classList.add("slide-in");
        }, 300);
    });

    // Mostrar las instrucciones
    howToPlayBtn.addEventListener("click", () => {
        animateMenuOut();
        setTimeout(() => {
            howToPlay.classList.remove("hidden");
            howToPlay.classList.add("slide-in");
            initializeCarousel(); // Inicializar el carrusel
        }, 300);
    });

    // Volver desde el formulario de registro
    backFromRegister.addEventListener("click", () => {
        registerForm.classList.add("slide-out");
        setTimeout(() => {
            registerForm.classList.add("hidden");
            registerForm.classList.remove("slide-in", "slide-out");
            animateMenuIn();
        }, 300);
    });

    // Volver desde las instrucciones
    backFromHowto.addEventListener("click", () => {
        howToPlay.classList.add("slide-out");
        setTimeout(() => {
            howToPlay.classList.add("hidden");
            howToPlay.classList.remove("slide-in", "slide-out");
            animateMenuIn();
        }, 300);
    });

    // Animación para ocultar el menú principal
    function animateMenuOut() {
        const menuOptions = document.querySelector(".menu-options");
        menuOptions.classList.add("slide-out");
        setTimeout(() => {
            menuOptions.classList.add("hidden");
            menuOptions.classList.remove("slide-out");
        }, 300);
    }

    // Animación para mostrar el menú principal
    function animateMenuIn() {
        const menuOptions = document.querySelector(".menu-options");
        menuOptions.classList.remove("hidden");
        menuOptions.classList.add("slide-in");
        setTimeout(() => {
            menuOptions.classList.remove("slide-in");
        }, 300);
    }

    // Crear partículas de fondo
    function createParticles() {
        // Limpiar cualquier partícula anterior
        particlesContainer.innerHTML = "";

        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            particle.classList.add("particle");

            // Posición aleatoria
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;

            // Tamaño aleatorio
            const size = Math.random() * 3 + 1;

            // Opacidad aleatoria
            const opacity = Math.random() * 0.5 + 0.2;

            // Duración aleatoria
            const duration = Math.random() * 15 + 10;

            // Retraso aleatorio
            const delay = Math.random() * 5;

            // Aplicar estilos
            particle.style.left = `${posX}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = opacity;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            // Añadir al contenedor
            particlesContainer.appendChild(particle);
        }
    }

    // Efecto parallax en el fondo
    document.addEventListener("mousemove", (e) => {
        const moveX = (e.clientX / window.innerWidth) * 10;
        const moveY = (e.clientY / window.innerHeight) * 10;

        // Suave movimiento de parallax
        startContainer.style.transform = `translate(${moveX - 5}px, ${moveY - 5}px)`;
    });

    // =======================================
    // Funcionalidad del carrusel
    // =======================================

    let currentSlide = 0;
    const slidesContainer = document.getElementById("instructionsCarousel");
    const slides = slidesContainer.querySelectorAll(".carousel-slide");
    const dotsContainer = document.getElementById("carouselDots");
    const prevButton = document.getElementById("prevSlide");
    const nextButton = document.getElementById("nextSlide");

    function initializeCarousel() {
        if (!slides.length) return;

        // Crear dots de navegación
        dotsContainer.innerHTML = "";
        slides.forEach((_, index) => {
            const dot = document.createElement("div");
            dot.classList.add("carousel-dot");
            if (index === currentSlide) {
                dot.classList.add("active");
            }
            dot.addEventListener("click", () => {
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });

        // Configurar posición inicial
        updateCarousel();

        // Añadir eventos para botones de navegación
        prevButton.addEventListener("click", prevSlide);
        nextButton.addEventListener("click", nextSlide);

        // Manejar navegación con teclado
        document.addEventListener("keydown", (e) => {
            if (!howToPlay.classList.contains("hidden")) {
                if (e.key === "ArrowLeft") {
                    prevSlide();
                } else if (e.key === "ArrowRight") {
                    nextSlide();
                }
            }
        });
    }

    function updateCarousel() {
        // Actualizar posición del carrusel
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Actualizar dots
        const dots = dotsContainer.querySelectorAll(".carousel-dot");
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
        } else {
            currentSlide = 0; // Volver al principio
        }
        updateCarousel();
    }

    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = slides.length - 1; // Ir al final
        }
        updateCarousel();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }

    // Autoplay del carrusel (opcional)
    let autoplayInterval;

    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Cambiar cada 5 segundos
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Detener autoplay cuando el usuario interactúa
    slidesContainer.addEventListener("mouseenter", stopAutoplay);
    slidesContainer.addEventListener("mouseleave", startAutoplay);

    // Inicializar el autoplay
    function setupCarouselAutoplay() {
        if (howToPlay.classList.contains("hidden")) return;
        startAutoplay();
    }

    // Inicialización
    createParticles();

    // El carrusel se inicializará cuando se muestre el panel de instrucciones
});
