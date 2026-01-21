// ========================================
// MAIN.JS - Portfolio Core Functionality
// ========================================

import { initTheme } from './theme.js';
import { initAnimations } from './animations.js';
import { initParticles } from './particles.js';
import { initDrone3D } from './drone3d.js';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAnimations();
    initParticles();
    initDrone3D();
    initNavbar();
    initTypingEffect();
    initProjectFilters();
    initContactForm();
    initMobileMenu();
});

// ===== NAVBAR =====
function initNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
    const typingElement = document.getElementById('typingText');
    if (!typingElement) return;

    const phrases = [
        'AI/ML Solutions Architect',
        'Computer Vision Expert',
        'NLP & LLM Specialist',
        'Turning Research into Products',
        'End-to-End AI Developer'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before typing new phrase
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

// ===== PROJECT FILTERS =====
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            projectCards.forEach(card => {
                const categories = card.dataset.category;

                if (filter === 'all' || categories.includes(filter)) {
                    card.style.display = 'block';
                    card.style.animation = 'fade-in-up 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Create mailto link
        const subject = encodeURIComponent(data.subject);
        const body = encodeURIComponent(
            `Hi Yash,\n\n${data.message}\n\nBest,\n${data.name}\n${data.email}`
        );

        window.location.href = `mailto:yashpratap424@gmail.com?subject=${subject}&body=${body}`;

        // Show success message
        alert('Opening your email client...');
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-active');
        menuBtn.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('mobile-active');
            menuBtn.classList.remove('active');
        });
    });
}

// Add mobile menu styles dynamically
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
  @media (max-width: 768px) {
    .nav-links {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: var(--space-xl);
      flex-direction: column;
      align-items: center;
      gap: var(--space-lg);
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-base);
    }
    
    .nav-links.mobile-active {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
      display: flex;
    }
    
    .nav-menu-btn.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-menu-btn.active span:nth-child(2) {
      opacity: 0;
    }
    
    .nav-menu-btn.active span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
`;
document.head.appendChild(mobileStyles);
