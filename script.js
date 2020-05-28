let canvas = document.querySelector(".canvas");
let runButton = document.querySelector(".run-button");
let distanceOut = document.querySelector(".distance");
let mInput = document.querySelector(".m");
let vInput = document.querySelector(".v");
let angleInput = document.querySelector(".alpha");
let kInput = document.querySelector(".k");
let outSpeed = document.querySelector(".speed")

let ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.strokeStyle = "black";



let points = [];
let distances = [];

function prepareCoordinates(point)
{
    let offset = 
    {
        x: 20,
        y: 20
    }

    let scale = 
    {
        x: (canvas.clientWidth - 2 * offset.x)  / 1000,
        y: (canvas.clientHeight - 2 * offset.y) / 500
    };

    let canvasPoint = 
    {
        x: point.x * scale.x + offset.x,
        y: canvas.clientHeight - (point.y * scale.y + offset.y)
    };

    return canvasPoint
}

function drawPoint(position) {
    ctx.beginPath();

    ctx.arc(position.x, position.y, 10, 0, 2 * Math.PI)
    ctx.stroke();
    ctx.fill();

    ctx.closePath();
}

function drawSegment(start, end)
{
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
}

function drawArrow(start, end) {
    let headLenght = 10; // length of head in pixels
    let angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineTo(end.x - headLenght * Math.cos(angle - Math.PI / 6), end.y - headLenght * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLenght * Math.cos(angle + Math.PI / 6), end.y - headLenght * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    ctx.closePath();
}

function getCoordinates(t, v, angle,  k, g)
{
    let coordinates =
    {
        x: v * Math.cos(angle) * t - k * t * t * Math.cos(angle) / 2,
        y: v * Math.sin(angle) * t - g *t * t / 2 - k * t * t * Math.sin(angle) / 2
    };
    if (coordinates.y < 0)
        coordinates.y = 0;

    return coordinates;
}

function calculate(pre, dt, g, K)
{
    let v = 
    {
        x: pre.v.x - K * pre.v.x * dt,
        y: pre.v.y - (g + K * pre.v.y) * dt
    }
    
    let position = 
    {
        x: pre.position.x + v.x * dt,
        y: pre.position.y + v.y * dt
    };
    if (position.y < 0)
        position.y = 0;
    
    let result = 
    {
        position: position,
        v: v
    };
    return result;
}

function drawLine(points)
{
    ctx.fillStyle = "black";
    points.forEach(point => {
        ctx.fillRect(point.x, point.y, 1, 1);
    });
}

function drawCoordinateSystem()
{
    drawArrow(prepareCoordinates({x: 0, y: 0}), prepareCoordinates({x: 1000, y: 0}));
    drawArrow(prepareCoordinates({x: 0, y: 0}), prepareCoordinates({x: 0, y: 500}));
}

function animate()
{
    let dt = 0.02;
    let t = dt;
    let v = parseFloat(vInput.value);
    let K = parseFloat(kInput.value);
    let g = 9.8;
    let angle = parseFloat(angleInput.value) * Math.PI / 180;
    
    trajectory = [];
    speedChartData = [];
    speedChartData.push({x: 0, y: v})
    
    let pre = 
    {
        position:
        {
            x: 0,
            y: 0
        },
        v: 
        {
            x: v * Math.cos(angle),
            y: v * Math.sin(angle),
        }
    }

    drawPoint(prepareCoordinates({x: 0, y: 0}));
    
    let animation = setInterval(() =>
    {
        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

        
        let current = calculate(pre, dt, g, K);

        trajectory.push(prepareCoordinates(current.position));

        let speed = Math.sqrt(current.v.x * current.v.x + current.v.y * current.v.y);
        speedChartData.push({x: t, y: speed})

        drawCoordinateSystem();
        drawPoint(prepareCoordinates(current.position));
        drawLine(trajectory);
        outSpeed.innerText = speed.toFixed(2);
        

        if (current.position.y == 0)
        {
            clearInterval(animation);
            runButton.disabled = false;
        }

        pre = current;
        t += dt;
    }, dt);
}

drawCoordinateSystem();
drawPoint(prepareCoordinates({x: 0, y: 0}));
runButton.addEventListener("click", () => 
{
    runButton.disabled = true;
    animate();
    
});