// Add Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            if (entry.target.classList.contains('stat-item')) {
                entry.target.classList.add('slide-up');
            }
        }
    });
}, {
    threshold: 0.1
});

// Observe elements
document.querySelectorAll('.hero-text, .app-showcase, .stat-item').forEach(el => {
    observer.observe(el);
});

// App preview parallax effect
const appPreview = document.querySelector('.app-preview');
if (appPreview) {
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xAxis = (clientX - innerWidth / 2) / 25;
        const yAxis = (clientY - innerHeight / 2) / 25;
        
        appPreview.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${-yAxis}deg)`;
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
