// Simplex Noise (simplified 2D)
class SimplexNoise {
    constructor(seed = Math.random()) {
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        this.p = [];
        for (let i = 0; i < 256; i++) this.p[i] = Math.floor(seed * 256 + i) % 256;
        this.perm = [];
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }

    dot(g, x, y) { return g[0] * x + g[1] * y; }

    noise(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;
        let s = (xin + yin) * F2;
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);
        let t = (i + j) * G2;
        let X0 = i - t, Y0 = j - t;
        let x0 = xin - X0, y0 = yin - Y0;
        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }
        let x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        let x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        let ii = i & 255, jj = j & 255;
        let gi0 = this.perm[ii + this.perm[jj]] % 12;
        let gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        let gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
        let n0 = 0, n1 = 0, n2 = 0;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); }
        return 70 * (n0 + n1 + n2);
    }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TERRAIN = {
    pixels: null,
    width: 0,
    height: 0,
    generate(width, height) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint8Array(width * height);
        const noise = new SimplexNoise();
        const baseHeight = height * 0.65;
        const amplitude = height * 0.2;
        
        for (let x = 0; x < width; x++) {
            let h = 0;
            h += noise.noise(x * 0.008, 0) * amplitude;
            h += noise.noise(x * 0.02, 0) * amplitude * 0.5;
            h += noise.noise(x * 0.05, 0) * amplitude * 0.25;
            let terrainTop = Math.floor(baseHeight - h);
            terrainTop = Math.max(20, Math.min(height - 40, terrainTop));
            
            for (let y = terrainTop; y < height; y++) {
                this.pixels[y * width + x] = 1;
            }
        }
    },
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        return this.pixels[y * this.width + x];
    },
    set(x, y, val) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.pixels[y * this.width + x] = val;
    },
    getHeightAt(x) {
        for (let y = 0; y < this.height; y++) {
            if (this.get(x, y)) return y;
        }
        return this.height;
    }
};

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    TERRAIN.generate(canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawTerrain() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            if (TERRAIN.get(x, y)) {
                const depth = y - TERRAIN.getHeightAt(x);
                if (depth < 10) {
                    imageData.data[idx] = 74; imageData.data[idx+1] = 124; imageData.data[idx+2] = 63;
                } else if (depth < 40) {
                    imageData.data[idx] = 139; imageData.data[idx+1] = 90; imageData.data[idx+2] = 43;
                } else {
                    imageData.data[idx] = 107; imageData.data[idx+1] = 107; imageData.data[idx+2] = 107;
                }
                imageData.data[idx+3] = 255;
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

drawTerrain();
