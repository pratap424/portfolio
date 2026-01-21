// ========================================
// DRONE3D.JS - 3D Drone Visualization
// ========================================

export function initDrone3D() {
    const canvas = document.getElementById('droneCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let rotation = 0;
    let propellerAngle = 0;
    let floatOffset = 0;

    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }

    // Draw stylized drone
    function drawDrone() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2 + Math.sin(floatOffset) * 10;
        const scale = Math.min(canvas.width, canvas.height) * 0.35;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get theme colors
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const primaryColor = isDark ? '#6366f1' : '#4f46e5';
        const secondaryColor = isDark ? '#22d3ee' : '#0891b2';
        const bodyColor = isDark ? '#1a1a25' : '#e2e8f0';
        const accentColor = isDark ? '#f8fafc' : '#0f172a';

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(rotation * 0.5) * 0.05);

        // Draw connecting arms
        const armLength = scale * 0.8;
        const armAngles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];

        armAngles.forEach((angle, i) => {
            const endX = Math.cos(angle + rotation * 0.1) * armLength;
            const endY = Math.sin(angle + rotation * 0.1) * armLength * 0.5;

            // Arm
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = bodyColor;
            ctx.lineWidth = 8;
            ctx.stroke();

            // Motor housing
            ctx.beginPath();
            ctx.arc(endX, endY, 15, 0, Math.PI * 2);
            ctx.fillStyle = accentColor;
            ctx.fill();

            // Propeller blur effect
            ctx.beginPath();
            ctx.ellipse(endX, endY, 35, 10, propellerAngle + i * Math.PI / 2, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(endX, endY, 0, endX, endY, 35);
            gradient.addColorStop(0, `${secondaryColor}80`);
            gradient.addColorStop(1, `${secondaryColor}00`);
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        // Central body
        ctx.beginPath();
        ctx.ellipse(0, 0, 40, 25, 0, 0, Math.PI * 2);
        const bodyGradient = ctx.createLinearGradient(-40, -25, 40, 25);
        bodyGradient.addColorStop(0, primaryColor);
        bodyGradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = bodyGradient;
        ctx.fill();

        // Camera lens
        ctx.beginPath();
        ctx.arc(0, 10, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 10, 8, 0, Math.PI * 2);
        const lensGradient = ctx.createRadialGradient(0, 10, 0, 0, 10, 8);
        lensGradient.addColorStop(0, '#4a5568');
        lensGradient.addColorStop(0.5, '#1a202c');
        lensGradient.addColorStop(1, '#2d3748');
        ctx.fillStyle = lensGradient;
        ctx.fill();

        // Lens reflection
        ctx.beginPath();
        ctx.arc(-2, 8, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // LED indicators
        const ledPositions = [
            { x: -25, y: 0 },
            { x: 25, y: 0 }
        ];

        ledPositions.forEach((pos, i) => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = i === 0 ? '#22c55e' : '#ef4444';
            ctx.fill();

            // LED glow
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = i === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
            ctx.fill();
        });

        ctx.restore();
    }

    // Animation loop
    function animate() {
        rotation += 0.02;
        propellerAngle += 0.3;
        floatOffset += 0.03;

        drawDrone();
        animationId = requestAnimationFrame(animate);
    }

    // Mouse interaction for rotation
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - canvas.width / 2;
        const y = e.clientY - rect.top - canvas.height / 2;
        rotation += x * 0.0001;
    });

    // Visibility handling
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });

    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}
