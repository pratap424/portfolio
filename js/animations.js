// ========================================
// ANIMATIONS.JS - Scroll Reveals & Counters
// ========================================

export function initAnimations() {
    initScrollReveal();
    initCounterAnimation();
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .stagger-children');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optionally unobserve after reveal
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

// ===== COUNTER ANIMATION =====
function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    statNumbers.forEach(el => {
        counterObserver.observe(el);
    });
}

function animateCounter(element, target) {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);

        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;

            // Add "+" suffix for large numbers
            if (target >= 100 && element.textContent !== '100') {
                element.textContent = target + '+';
            }
        }
    }

    requestAnimationFrame(updateCounter);
}

// ===== PARALLAX EFFECT (Optional) =====
export function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });
}
