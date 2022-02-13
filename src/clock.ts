class Model {
    private _time: Date
    
    public tick(): void {
        this._time = new Date();
    }

    get time() : Date {
        return this._time; 
    }
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let ctxWidth: number;
let ctxHeight: number;
let world: Model;
let ticks: 60;

let showDebugInfo: boolean = false
let showNumbers: boolean = true
let showBand: boolean = true
let bandValue: number = 10;

window.onload = init;

function init() {
    world = new Model();
    canvas = document.getElementById('canvas') as HTMLCanvasElement
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, false);
    window.requestAnimationFrame(gameLoop);
    window.addEventListener('keydown', event => {
        if (event.isComposing || event.keyCode === 229) {
            return
        }
        switch(event.key) {
            case 'd':
                showDebugInfo = !showDebugInfo;
                break;
            case 'n':
                showNumbers = !showNumbers;
                break;
            case 'b':
                showBand = !showBand;
        }
        
    })
    
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctxWidth = ctx.canvas.clientWidth;
    ctxHeight = ctx.canvas.clientHeight;
}

function gameLoop(timestamp: DOMHighResTimeStamp) {
    
    world.tick()
    draw();

    window.requestAnimationFrame(gameLoop)
}

function draw() {
    
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, ctxWidth, ctxHeight)

    
    // Determine clock center and radius
    const center_x = ctxWidth / 2;
    const center_y = ctxHeight / 2;
    const radius = Math.min(ctxWidth, ctxHeight) / 2 - 40

    if (showBand) {
        ctx.strokeStyle = `rgb(${bandValue}, ${bandValue}, ${bandValue})`;
        ctx.lineWidth = .1 * radius;
        ctx.beginPath();
        ctx.ellipse(center_x, center_y, radius, radius, 0, 0, 2 * Math.PI)
        ctx.stroke();
    }
    

    for ( let i = 0; i < 60; i++) {
        drawTick(center_x, center_y, radius, i)
    }
    
    if (showDebugInfo) {
        drawDebugInfo()
    }
}

function drawTick(center_x: number, center_y: number, radius: number, i: number) {
    const x = radius * Math.sin(2 * Math.PI / 60 * i) + center_x;
    const y = -radius * Math.cos(2 * Math.PI / 60 * i) + center_y;
    const tickSize = .04 * radius;
    
    let hHr = 0
    let hMin = 108
    let hSec = 178

    let hours = world.time.getHours() + world.time.getMinutes() / 60
    let minutes = world.time.getMinutes() + world.time.getSeconds() / 60
    let seconds = world.time.getSeconds() + world.time.getMilliseconds() / 1000
    
    let vHr = brightness(i, hours % 12 * 5);
    let vMin = brightness(i, minutes);
    let vSec = brightness(i, seconds);

    // ctx.fillStyle = `hsl(${h} 100% ${v*40}%)`;
    if (showBand) {
        ctx.fillStyle = `rgb(${bandValue + vHr * 255}, ${bandValue + vMin * 255}, ${bandValue + vSec * 255}`;
    } else {
        ctx.fillStyle = `rgb(${vHr * 255}, ${vMin * 255}, ${vSec * 255}`;
    }
    
    ctx.beginPath();
    ctx.ellipse(x, y, tickSize, tickSize, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    if (showNumbers) {
        ctx.font = `${1.5 * tickSize}px serif`;
        if (i % 5 == 0) {
            let hour = i / 5;
            if (hour == 0)
                hour = 12
            let size = ctx.measureText('' + hour)
            ctx.fillStyle = 'rgb(200, 200, 200)'
            ctx.fillText('' + hour, x-size.width / 2, y+ size.actualBoundingBoxAscent / 2);
        }
    }
}

function brightness(i: number, t: number) {
    const sigma = 0.35
    const mu = 0
    const wrap: number = 60
    
    // i = 4, t = 1: 4 - 1 = 3
    // i = 2, t = 5: -3
    // i = 2, t = 59: 2 - 59 = -57! (3)
    //  i + 60 - t = 62 - 59 = 3
    // i < ticks / 2 && t > 30
    // 
    //
    // i = 58, t = 55: 3
    // i = 58, t = 1: 57! (-3)
    //  i - 60 - t = -2 -1 = -3 
    let n = i - t;
    if (n < -wrap / 2) {
        n += wrap;
    } else if (n >= wrap / 2) {
        n -= wrap;
    }

    if (n > 0)
        return 0;

    return Math.exp(-Math.pow(n, 2) / 2 * sigma * sigma)
}

function drawDebugInfo() {
    const oldFillStyle = ctx.fillStyle
    ctx.fillStyle = '#bbb'
    ctx.font = '14px sans serif';

    const markerSize = 20;

    // Current time
    const time = world.time.toLocaleTimeString();
    const timeSize = ctx.measureText(time)
    ctx.fillText(time, ctxWidth - markerSize - 5 - timeSize.width, ctxHeight - 5);
    
    debug_drawCanvasMarkers(markerSize);

    ctx.fillStyle = oldFillStyle;
}

function debug_drawCanvasMarkers(size: number) {
    ctx.fillRect(0, 0, size, size);
    ctx.fillRect(ctxWidth - size, 0, size, size);
    ctx.fillRect(0, ctxHeight - size, size, size);
    ctx.fillRect(ctxWidth - size, ctxHeight - size, size, size)
}