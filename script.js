document.addEventListener('DOMContentLoaded', () => {
    
    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Mobile Menu Toggle ---
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    console.log(hamburgerBtn);
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-item');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        navLinks.classList.toggle('mobile-active');
        hamburgerBtn.setAttribute('aria-expanded', isMenuOpen);
        
        if (isMenuOpen) {
            hamburgerBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            document.body.style.overflow = '';
        }
    }

    hamburgerBtn.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });

    // Close menu when clicking anywhere outside the link list
    // (clicking the open padded area of the panel itself, not a link)
    navLinks.addEventListener('click', (e) => {
        if (e.target === navLinks && isMenuOpen) {
            toggleMenu();
        }
    });

    // Close menu when clicking anywhere outside the nav entirely
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !e.target.closest('nav')) {
            toggleMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            toggleMenu();
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    // --- Scroll Progress Bar ---
    const scrollProgress = document.getElementById('scroll-progress');
    
    let isProgressScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isProgressScrolling) {
            window.requestAnimationFrame(() => {
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollPercentage = (scrollTop / scrollHeight) * 100;
                scrollProgress.style.width = scrollPercentage + '%';
                isProgressScrolling = false;
            });
            isProgressScrolling = true;
        }
    }, { passive: true });

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top');
    const heroSection = document.getElementById('home');
    
    let isBttScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isBttScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > (heroSection.offsetHeight / 2)) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
                isBttScrolling = false;
            });
            isBttScrolling = true;
        }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Intersection Observers ---

    // 1. Active Nav Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    
    const navObserverOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${currentId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });

    // Respect prefers-reduced-motion for animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Section Reveal Animation
    const revealElements = document.querySelectorAll('.section-reveal');
    
    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, { root: null, rootMargin: '0px 0px -100px 0px', threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    // 3. Skills Staggered Animation
    const skillTiles = document.querySelectorAll('.skill-tile');
    
    if (!prefersReducedMotion) {
        const skillObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Staggering is done via CSS transition delays calculated here
                    const index = Array.from(skillTiles).indexOf(entry.target);
                    entry.target.style.transitionDelay = `${(index % 4) * 50}ms`;
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

        skillTiles.forEach(tile => skillObserver.observe(tile));
    } else {
        skillTiles.forEach(tile => tile.classList.add('revealed'));
    }

    // --- Contact Form Validation & Mailto Action ---
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function setFieldStatus(fieldId, isValid) {
        const fieldGroup = document.getElementById(fieldId).closest('.form-group');
        if (isValid) {
            fieldGroup.classList.remove('has-error');
            fieldGroup.classList.add('has-success');
        } else {
            fieldGroup.classList.remove('has-success');
            fieldGroup.classList.add('has-error');
        }
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        
        let isValid = true;

        // Name Validation
        if (nameInput.value.trim() === '') {
            setFieldStatus('name', false);
            isValid = false;
        } else {
            setFieldStatus('name', true);
        }

        // Email Validation
        if (!validateEmail(emailInput.value.trim())) {
            setFieldStatus('email', false);
            isValid = false;
        } else {
            setFieldStatus('email', true);
        }

        // Subject Validation
        if (subjectInput.value.trim() === '') {
            setFieldStatus('subject', false);
            isValid = false;
        } else {
            setFieldStatus('subject', true);
        }

        // Message Validation
        if (messageInput.value.trim() === '') {
            setFieldStatus('message', false);
            isValid = false;
        } else {
            setFieldStatus('message', true);
        }

        if (isValid) {
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Opening your email client... <i class="fa-solid fa-envelope-open"></i>';
            submitBtn.disabled = true;

            const e1 = "kawinus2"; const e2 = "gmail.com";
            const targetEmail = `${e1}@${e2}`;
            const subject = encodeURIComponent(subjectInput.value.trim());
            const body = encodeURIComponent(`From: ${nameInput.value.trim()} (${emailInput.value.trim()})\n\nMessage:\n${messageInput.value.trim()}`);
            
            const mailtoLink = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
            
            // Trigger mailto
            window.location.href = mailtoLink;

            // Reset form and button after a short delay
            setTimeout(() => {
                contactForm.reset();
                document.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('has-success');
                });
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });

    // Optional: Validation on blur for immediate feedback
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') {
                if (input.type === 'email') {
                    setFieldStatus(input.id, validateEmail(input.value.trim()));
                } else {
                    setFieldStatus(input.id, true);
                }
            }
        });
    });

});
