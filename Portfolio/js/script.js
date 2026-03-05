document.addEventListener('DOMContentLoaded', () => {

    // 1. Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);

    // 2. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    if (revealElements.length > 0) {
        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll(); // Trigger once on load
    }

    // 3. Smooth Navigation for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }

                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for fixed nav
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }


    // 5. Sticky Navbar shadow on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // 6. Dynamic Blog Data Fetching
    const blogGrid = document.querySelector('.blog-grid');
    if (blogGrid) {
        loadBlogPosts(blogGrid);
    }

    // 7. Background Animation (Fiber Optics / Network)
    initBackgroundAnimation();
});

async function loadBlogPosts(container) {
    try {
        // Fetch from Netlify Serverless Function
        // Note: This works when deployed. Locally, you need 'netlify dev' to simulate it.
        // Fallback to local JSON if function fails (for local testing without netlify cli)
        let response;
        try {
            response = await fetch('/.netlify/functions/blog-api');
            if (!response.ok) throw new Error('Function not reachable');
        } catch (e) {
            console.warn('Backend not running, falling back to local JSON for demo');
            response = await fetch('data/blog.json');
        }

        if (!response.ok) throw new Error('Failed to fetch posts');

        const posts = await response.json();

        if (posts.length === 0) {
            container.innerHTML = '<p class="text-center">No articles found.</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <article class="blog-post reveal active">
                <div class="post-date">${post.date}</div>
                <h4>${post.title}</h4>
                <p>${post.excerpt}</p>
                <a href="post.html?id=${post.id}" class="btn btn-outline btn-sm">Read Article →</a>
            </article>
        `).join('');

        // Re-trigger animations for new elements
        const newReveals = container.querySelectorAll('.reveal');
        setTimeout(() => {
            newReveals.forEach(el => el.classList.add('active'));
        }, 100);

    } catch (error) {
        console.error('Error loading blog posts:', error);
        container.innerHTML = '<p class="text-center">Could not load articles. Please run on a local server to view dynamic content.</p>';
    }
}

function initBackgroundAnimation() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Configuration for "Fiber Optics" feel
    // Low density for professionalism, blue/purple hues for tech/business
    const particleCount = 100; // Increased density
    const connectionDistance = 180; // Longer connections
    const speed = 0.5; // Slightly faster movement

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.4)'; // Adjusted for light mode
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Draw connections (Fiber lines)
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    const opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.4})`; // Much clearer lines
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        particles = []; // Respawn on resize to avoid clustering
        init();
    });

    init();
    animate();
}
