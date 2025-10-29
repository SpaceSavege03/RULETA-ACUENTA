class WheelOfFortune {
    constructor() {
        this.wheel = document.getElementById('wheel');
        this.spinButton = document.getElementById('spinButton');
        this.resultModal = document.getElementById('resultModal');
        this.prizeDisplay = document.getElementById('prizeDisplay');
        this.claimButton = document.getElementById('claimButton');
        this.closeModal = document.getElementById('closeModal');
        
        this.isSpinning = false;
        this.currentRotation = 0;
        
        // Sectores se cargarán desde el HTML
        this.sectors = [];
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.spinButton.addEventListener('click', () => this.spin());
        this.claimButton.addEventListener('click', () => this.claimPrize());
        this.closeModal.addEventListener('click', () => this.closeModalHandler());
        
        // Cerrar modal al hacer clic fuera
        this.resultModal.addEventListener('click', (e) => {
            if (e.target === this.resultModal) {
                this.closeModalHandler();
            }
        });
        
        // Cargar sectores desde el HTML para que coincidan 1:1 con lo visible
        this.loadSectorsFromDOM();

        // Añadir efectos de sonido (simulados con vibración en móviles)
        this.initHapticFeedback();

        // Ajuste de tamaños de texto inicial y en redimensionamiento
        this.adjustLabelSizes();
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.adjustLabelSizes(), 100);
        });
    }
    
    initHapticFeedback() {
        // Detectar si estamos en un dispositivo móvil
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.spinButton.textContent = 'GIRANDO...';
        
        // Vibración en dispositivos móviles
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        // Calcular rotación aleatoria
        const randomSpin = Math.random() * 360;
        const extraSpins = 5 + Math.random() * 5; // Entre 5 y 10 vueltas extra
        const totalRotation = this.currentRotation + (extraSpins * 360) + randomSpin;
        
        // Aplicar rotación
        this.wheel.style.transform = `rotate(${totalRotation}deg)`;
        this.currentRotation = totalRotation % 360;
        
        // Calcular premio ganado
        const normalizedAngle = (360 - (this.currentRotation % 360)) % 360;
        const winningPrize = this.calculateWinningPrize(normalizedAngle);
        
        // Mostrar resultado después de la animación
        setTimeout(() => {
            this.showResult(winningPrize);
            this.isSpinning = false;
            this.spinButton.disabled = false;
            this.spinButton.textContent = '¡GIRAR!';
        }, 4000);
        // Efectos visuales durante el giro (desactivados para evitar parpadeos)
        // this.addSpinningEffects();
    }
    
    calculateWinningPrize(angle) {
        // Cada sector tiene 45 grados
        const sectorSize = 360 / this.sectors.length;
        const sectorIndex = Math.floor(angle / sectorSize);
        return this.sectors[sectorIndex];
    }
    
    addSpinningEffects() {
        // Añadir clase de celebración al contenedor
        const container = document.querySelector('.container');
        container.classList.add('celebrating');
        
        setTimeout(() => {
            container.classList.remove('celebrating');
        }, 4000);
        
        // Efectos de partículas (simulados con elementos CSS)
        this.createParticles();
    }
    
    createParticles() {
        const wheelContainer = document.querySelector('.wheel-container');
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.background = this.getRandomColor();
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10';
            
            const angle = (i / 15) * 2 * Math.PI;
            const radius = 150 + Math.random() * 50;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            particle.style.left = `calc(50% + ${x}px)`;
            particle.style.top = `calc(50% + ${y}px)`;
            particle.style.opacity = '0';
            
            wheelContainer.appendChild(particle);
            
            // Animar partícula
            setTimeout(() => {
                particle.style.transition = 'all 2s ease-out';
                particle.style.opacity = '1';
                particle.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0)`;
            }, i * 100);
            
            // Limpiar partícula
            setTimeout(() => {
                particle.remove();
            }, 3000);
        }
    }

    adjustLabelSizes() {
        // Escala texto de sectores según tamaño de la rueda y longitudes reales (shrink-to-fit)
        const wrapper = document.querySelector('.wheel-wrapper');
        if (!wrapper || !this.wheel) return;
    const w = wrapper.offsetWidth || 320;
    const base = Math.max(12, Math.min(22, Math.round(w * 0.05))); // ~5% del ancho para asegurar cabida

        const spans = this.wheel.querySelectorAll('.sector span');
        spans.forEach(span => {
            // Reset a estado base para medir
            span.style.fontSize = `${base}px`;
            span.style.transform = 'translate(-50%, -50%) rotate(-22.5deg) scale(1)';

            // Medidas disponibles dentro del span (ancho) y umbral de altura permisible
            const availableW = span.clientWidth || (w * 0.5);
            const box = span.getBoundingClientRect();
            const measuredW = span.scrollWidth;
            const measuredH = span.scrollHeight;
            const maxH = Math.max(32, Math.round(w * 0.22)); // altura máxima de caja de texto

            // Calcular escala necesaria si sobrepasa
            let scaleW = availableW > 0 ? Math.min(1, availableW / measuredW) : 1;
            let scaleH = measuredH > 0 ? Math.min(1, maxH / measuredH) : 1;
            let scale = Math.max(0.6, Math.min(scaleW, scaleH)); // permite reducir un poco más si hace falta

            // Si el texto es muy largo, baja un poco el tamaño base
            const len = (span.innerText || '').replace(/\s+/g, '').length;
            if (len > 18) scale = Math.min(scale, 0.96);
            if (len > 24) scale = Math.min(scale, 0.92);
            if (len > 32) scale = Math.min(scale, 0.88);
            if (len > 40) scale = Math.min(scale, 0.84);

            span.style.transform = `translate(-50%, -50%) rotate(-22.5deg) scale(${scale})`;
        });
    }
    
    getRandomColor() {
        const colors = ['#dc2626', '#2563eb', '#059669', '#d97706', '#7c3aed', '#fbbf24'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    showResult(winningPrize) {
        this.prizeDisplay.textContent = winningPrize.prize;
        const baseColor = this.normalizeColor(winningPrize.color || '#E30613');
        this.prizeDisplay.style.background = `linear-gradient(135deg, ${baseColor}, ${this.darkenColor(baseColor, 20)})`;
        this.resultModal.style.display = 'flex';
        
        // Vibración de celebración
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
        // Efecto sparkle removido por solicitud
    }
    
    darkenColor(color, amount) {
        // Función para oscurecer un color hex
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    claimPrize() {
        // Aquí puedes agregar la lógica para reclamar el premio
        this.showClaimAnimation();
        setTimeout(() => {
            this.closeModalHandler();
        }, 1500);
    }
    
    showClaimAnimation() {
        const claimButton = this.claimButton;
        claimButton.textContent = '¡RECLAMADO!';
        claimButton.style.background = '#059669';
        claimButton.style.transform = 'scale(1.1)';
        
        // Vibración de confirmación
        if (this.isMobile && navigator.vibrate) {
            navigator.vibrate(200);
        }
        
        setTimeout(() => {
            claimButton.style.transform = 'scale(1)';
        }, 200);
    }
    
    closeModalHandler() {
        this.resultModal.style.display = 'none';
        this.claimButton.textContent = 'Reclamar Premio';
        this.claimButton.style.background = '#059669';
        this.claimButton.style.transform = 'scale(1)';
    }

    loadSectorsFromDOM() {
        const sectorEls = this.wheel ? this.wheel.querySelectorAll('.sector') : [];
        const count = sectorEls.length || 8;
        const sectorSize = 360 / count;
        this.sectors = Array.from(sectorEls).map((el, idx) => {
            const prize = el.dataset.prize?.trim() || (el.textContent || '').trim();
            const bg = getComputedStyle(el).backgroundColor; // puede venir como rgb
            return {
                angle: idx * sectorSize,
                prize,
                color: bg
            };
        });
    }

    normalizeColor(color) {
        // Acepta hex o rgb(a) y devuelve hex
        if (!color) return '#E30613';
        if (color.startsWith('#')) return color;
        // rgb or rgba
        const m = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (!m) return '#E30613';
        const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
        const toHex = (v) => v.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}

// Funcionalidad adicional para navegación
class NavigationHandler {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.init();
    }
    
    init() {
        this.navItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.handleNavigation(index);
            });
        });
    }
    
    handleNavigation(index) {
        // Vibración para navegación en móviles
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Efecto visual
        this.navItems.forEach(item => item.style.opacity = '0.6');
        this.navItems[index].style.opacity = '1';
        
        setTimeout(() => {
            this.navItems.forEach(item => item.style.opacity = '1');
        }, 200);
        
        // Aquí puedes agregar la lógica de navegación real
        switch(index) {
            case 0: // HOME
                console.log('Navegando a HOME');
                break;
            case 1: // STORE
                console.log('Navegando a STORE');
                break;
            case 2: // OFERTAS
                console.log('Navegando a OFERTAS');
                break;
        }
    }
}

// Funcionalidad de orientación para dispositivos móviles
class OrientationHandler {
    constructor() {
        this.init();
    }
    
    init() {
        // Detectar cambios de orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Detectar redimensionamiento de ventana
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    handleOrientationChange() {
        // Reajustar el tamaño de la ruleta según la orientación
        const wheel = document.querySelector('.wheel-wrapper');
        const container = document.querySelector('.container');
        
        if (window.innerHeight < window.innerWidth) {
            // Modo landscape
            wheel.style.width = Math.min(window.innerHeight * 0.6, 280) + 'px';
            wheel.style.height = Math.min(window.innerHeight * 0.6, 280) + 'px';
            container.style.padding = '5px';
        } else {
            // Modo portrait
            wheel.style.width = Math.min(window.innerWidth * 0.7, 280) + 'px';
            wheel.style.height = Math.min(window.innerWidth * 0.7, 280) + 'px';
            container.style.padding = '10px';
        }
    }
    
    handleResize() {
        // Throttle para evitar llamadas excesivas
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.handleOrientationChange();
        }, 100);
    }
}

// Performance y optimización
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        // Precargar recursos críticos
        this.preloadResources();
        
        // Optimizar para dispositivos de baja potencia
        this.optimizeForLowEndDevices();
        
        // Lazy loading para elementos no críticos
        this.setupLazyLoading();
    }
    
    preloadResources() {
        // Precargar fuentes y recursos críticos
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
        link.as = 'style';
        document.head.appendChild(link);
    }
    
    optimizeForLowEndDevices() {
        // Detectar dispositivos de baja potencia
        const isLowEnd = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;
        
        if (isLowEnd) {
            // Reducir efectos y animaciones
            document.body.classList.add('low-end-device');
            
            // CSS para dispositivos de baja potencia
            const style = document.createElement('style');
            style.textContent = `
                .low-end-device * {
                    transition-duration: 0.2s !important;
                }
                .low-end-device .wheel {
                    transition: transform 2s ease-out !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    setupLazyLoading() {
        // Implementar lazy loading para elementos no críticos
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                }
            });
        }, observerOptions);
        
        // Observar elementos que se cargan bajo demanda
        document.querySelectorAll('.lazy-load').forEach(el => {
            observer.observe(el);
        });
    }
}

// Inicialización cuando el DOM esté listo
// ----- Evento simple tipo EventEmitter -----
class EventEmitter {
    constructor(){ this.listeners = {}; }
    on(evt, cb){ (this.listeners[evt] ||= new Set()).add(cb); return () => this.off(evt, cb); }
    off(evt, cb){ this.listeners[evt]?.delete(cb); }
    emit(evt, payload){ this.listeners[evt]?.forEach(fn => fn(payload)); }
}

// ----- Ruleta tipo Canvas con fricción, basada en el snippet del usuario -----
class SpinWheel {
    constructor({ canvasSelector, buttonSelector, sectors, friction = 0.991 }) {
        this.sectors = sectors;
        this.friction = friction;
        this.canvas = document.querySelector(canvasSelector);
        this.context = this.canvas.getContext('2d');
        this.button = document.querySelector(buttonSelector);

        this.dpr = window.devicePixelRatio || 1;
        this.diameter = this.canvas.width;
        this.radius = this.diameter / 2;
        this.totalSectors = sectors.length;
        this.arcAngle = (2 * Math.PI) / this.totalSectors;
        this.angle = 0;
        this.angularVelocity = 0;
        this.spinButtonClicked = false;
        this.events = new EventEmitter();

        this.handleResize = this.handleResize.bind(this);
        this.init();
    }

    static randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    get currentIndex() {
        return (Math.floor(this.totalSectors - (this.angle / (2 * Math.PI)) * this.totalSectors) % this.totalSectors);
    }

    handleResize() {
        const wrapper = this.canvas.parentElement;
        const size = Math.min(wrapper.clientWidth, wrapper.clientHeight || wrapper.clientWidth);
        const px = Math.max(200, Math.round(size));
        // Escalado para pantallas retina
        this.canvas.width = Math.round(px * this.dpr);
        this.canvas.height = Math.round(px * this.dpr);
        this.canvas.style.width = px + 'px';
        this.canvas.style.height = px + 'px';
        this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.diameter = px;
        this.radius = px / 2;
        this.drawWheel();
        this.rotateCanvas();
    }

    drawWheel() {
        const ctx = this.context;
        const r = this.radius;
        const d = this.diameter;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Borde exterior
        ctx.save();
        ctx.translate(r, r);
        for (let i = 0; i < this.sectors.length; i++) {
            const sector = this.sectors[i];
            const startAngle = this.arcAngle * i;
            ctx.beginPath();
            ctx.fillStyle = sector.color;
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, startAngle, startAngle + this.arcAngle);
            ctx.closePath();
            ctx.fill();

            // Texto
            ctx.save();
            ctx.rotate(startAngle + this.arcAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = sector.textColor || '#fff';
            const fontPx = Math.max(12, Math.min(22, Math.round(d * 0.06)));
            ctx.font = `bold ${fontPx}px Helvetica, Arial, sans-serif`;
            // Posición del texto a ~80% del radio
            ctx.fillText(sector.label, r - Math.max(10, d * 0.05), 0);
            ctx.restore();
        }
        // Anillo/borde
        ctx.beginPath();
        ctx.lineWidth = Math.max(2, Math.round(d * 0.02));
        ctx.strokeStyle = '#B8000A';
        ctx.arc(0, 0, r - ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    rotateCanvas() {
        // Rotar el elemento canvas para animar; el puntero (HTML) queda fijo
        this.canvas.style.transform = `rotate(${this.angle - Math.PI / 2}rad)`;
    }

    updateFrame() {
        if (!this.angularVelocity && this.spinButtonClicked) {
            const winningSector = this.sectors[this.currentIndex];
            this.events.emit('finishSpinning', winningSector);
            this.spinButtonClicked = false;
            return;
        }
        this.angularVelocity *= this.friction;
        if (this.angularVelocity < 0.002) this.angularVelocity = 0;
        this.angle += this.angularVelocity;
        this.angle %= 2 * Math.PI;
        this.rotateCanvas();
    }

    startSimulation() {
        const animate = () => {
            this.updateFrame();
            requestAnimationFrame(animate);
        };
        animate();
    }

    init() {
        // Dibujo inicial (tamaño se ajusta con resize)
        this.handleResize();
        window.addEventListener('resize', this.handleResize);

        this.startSimulation();

        this.button.addEventListener('click', () => {
            if (!this.angularVelocity) this.angularVelocity = SpinWheel.randomInRange(0.25, 0.45);
            this.spinButtonClicked = true;
        });
    }
}

function parseRgbToObj(rgbStr){
    const m = rgbStr && rgbStr.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return {r:227,g:6,b:19};
    return {r: +m[1], g: +m[2], b: +m[3]};
}
function getTextColorForBg(rgbStr){
    const {r,g,b} = parseRgbToObj(rgbStr);
    const luminance = (0.299*r + 0.587*g + 0.114*b);
    return luminance > 150 ? '#111' : '#fff';
}

document.addEventListener('DOMContentLoaded', () => {
    // Construir sectores desde el HTML existente
    const sectorEls = document.querySelectorAll('#wheel .sector');
    const sectors = Array.from(sectorEls).map((el) => {
        // Preferimos el texto visible del span (con <br>) sobre data-prize
        const label = ((el.textContent && el.textContent.trim()) || el.dataset.prize || '').replace(/\s+/g, ' ').trim();
        const bg = getComputedStyle(el).backgroundColor;
        const textColor = getTextColorForBg(bg);
        return { label, color: bg, textColor };
    });

    // Ocultar la ruleta HTML (si no la ocultó el CSS)
    const domWheel = document.getElementById('wheel');
    if (domWheel) domWheel.style.display = 'none';

    // Instanciar la ruleta canvas
    const canvasWheel = new SpinWheel({
        canvasSelector: '#wheelCanvas',
        buttonSelector: '#spinButton',
        sectors,
        friction: 0.991,
    });

    // Mostrar resultado en el modal al finalizar
    const resultModal = document.getElementById('resultModal');
    const prizeDisplay = document.getElementById('prizeDisplay');
    const claimButton = document.getElementById('claimButton');
    const closeModal = document.getElementById('closeModal');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    canvasWheel.events.on('finishSpinning', (winningSector) => {
        prizeDisplay.textContent = winningSector.label;
        prizeDisplay.style.background = winningSector.color;
        resultModal.style.display = 'flex';
        if (isMobile && navigator.vibrate) navigator.vibrate([100,50,100]);
    });

    claimButton?.addEventListener('click', () => {
        resultModal.style.display = 'none';
    });
    closeModal?.addEventListener('click', () => {
        resultModal.style.display = 'none';
    });
});