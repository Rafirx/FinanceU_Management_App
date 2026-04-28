/**
 * Generative Background inspired by Active Theory
 * Interactive particle mesh with cinematic motion
 */

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 120; // Increased for a richer starry effect
let w, h;
let mouse = { x: null, y: null, radius: 200 };

function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.radius = Math.random() * 2 + 0.5;
        this.baseRadius = this.radius;
        this.alpha = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;

        // Mouse reaction
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const force = (mouse.radius - dist) / mouse.radius;
                this.x -= dx * force * 0.03;
                this.y -= dy * force * 0.03;
                this.radius = this.baseRadius + force * 3;
            } else {
                this.radius = this.baseRadius;
            }
        }
    }

    draw() {
        const isLight = document.body.classList.contains('light-mode');
        const baseColor = isLight ? '0, 150, 180' : '0, 229, 255'; // Slightly darker cyan for light mode
        const alphaScale = isLight ? 1.5 : 1;
        ctx.fillStyle = `rgba(${baseColor}, ${Math.min(1, this.alpha * alphaScale)})`;
        
        // Dynamic glow based on mouse proximity
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                ctx.shadowBlur = isLight ? 8 : 15;
                ctx.shadowColor = `rgba(${baseColor}, 0.8)`;
            } else {
                ctx.shadowBlur = 0;
            }
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

function drawFancyLines() {
    const isLight = document.body.classList.contains('light-mode');
    const baseColor = isLight ? '0, 150, 180' : '0, 229, 255';
    const maxDist = 150;

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
                const opacity = (1 - dist / maxDist) * (isLight ? 0.6 : 0.25); // Increased opacity for light mode
                
                // Create a linear gradient for the line between the two particles
                const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                grad.addColorStop(0, `rgba(${baseColor}, ${opacity})`);
                grad.addColorStop(1, `rgba(${baseColor}, ${opacity * 0.3})`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = (1 - dist / maxDist) * (isLight ? 1.5 : 1.2);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}


function animate() {
    ctx.clearRect(0, 0, w, h);
    
    const isLight = document.body.classList.contains('light-mode');
    const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
    if (isLight) {
        grad.addColorStop(0, 'rgba(240, 242, 245, 0)');
        grad.addColorStop(1, 'rgba(219, 234, 254, 0.4)');
    } else {
        grad.addColorStop(0, 'rgba(8, 12, 20, 0)');
        grad.addColorStop(1, 'rgba(30, 27, 75, 0.3)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    drawFancyLines(); // Draw lines first for better layering

    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animate);
}


window.addEventListener('resize', init);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

init();
animate();

