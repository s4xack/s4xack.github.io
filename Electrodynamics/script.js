let canvas = document.querySelector(".canvas");
let chart1 = document.querySelector(".chart1");
let chart2 = document.querySelector(".chart2");

let runButton = document.querySelector(".run-button");
let stopButton = document.querySelector(".stop-button");
let trButton = document.querySelector(".tr-button");

let mInput = document.querySelector(".m");
let vInput = document.querySelector(".v");
let angleInput = document.querySelector(".alpha");
let qInput = document.querySelector(".q");
let QInput = document.querySelector(".Q");
let RInput = document.querySelector(".R");

let ctx = canvas.getContext("2d");
let ch1 = null;
let ch2 = null;

ctx.fillStyle = "black";
ctx.strokeStyle = "black";
ctx.font = "22px serif";



let points = [];
let distances = [];

function distance(start, end)
{
    return Math.sqrt((start.x - end.x) * (start.x - end.x) + (start.y - end.y) * (start.y - end.y));
}

function prepareCoordinates(point)
{
    let offset = 
    {
        x: 20,
        y: 20
    }

    let scale = 
    {
        x: (canvas.clientWidth - 2 * offset.x)  / 10,
        y: (canvas.clientHeight - 2 * offset.y) / 10
    };

    let canvasPoint = 
    {
        x: (point.x + 5) * scale.x + offset.x,
        y: canvas.clientHeight - ((point.y + 5) * scale.y + offset.y)
    };

    return canvasPoint
}

function drawPoint(position) {
    ctx.beginPath();

    ctx.arc(position.x, position.y, 5, 0, 2 * Math.PI)
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
    if (coordinates.y > 2)
        coordinates.y = 2;
    if (coordinates.x < 0)
        coordinates.x = 0;
    if (coordinates.x > 2)
        coordinates.x = 2;

    return coordinates;
}

function calculate(pre, dt, m, q, Q, R)
{
    let r = distance(pre.position, {x: 0, y: 0});
    let f = - q * Q / (r * r * r * m);
    let v = 
    {
        x: pre.v.x + f * pre.position.x * dt,
        y: pre.v.y + f * pre.position.y * dt
    }
    
    let position = 
    {
        x: pre.position.x + v.x * dt,
        y: pre.position.y + v.y * dt
    };
    if (position.y < -5)
        position.y = -5;
    if (position.y > 5)
        position.y = 5;
    if (position.x < -5)
        position.x = -5;
    if (position.x > 5)
        position.x = 5;
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
    drawArrow(prepareCoordinates({x: -5, y: -5}), prepareCoordinates({x: 5, y: -5}));
    drawArrow(prepareCoordinates({x: -5, y: -5}), prepareCoordinates({x: -5, y: 5}));
}

function check()
{
    let v = parseFloat(vInput.value);
    let m = parseFloat(mInput.value);
    let q = parseFloat(qInput.value);
    let Q = parseFloat(QInput.value);
    let R = parseFloat(RInput.value);
    
    if (v < 0 || m < 0 || q < 0 || Q < 0 || R < 0)
    {
        alert("Все задаваемые величины должны быть положительными!");
        return false;
    }

    if (R > 5)
    {
        alert("Расстояние между зарядами должно быть не больше 5!");
        return false;
    }

    return true;
}

function animate()
{
    let dt = 0.02;
    let t = dt;
    let v = parseFloat(vInput.value);
    let m = parseFloat(mInput.value);
    let q = parseFloat(qInput.value);
    let Q = parseFloat(QInput.value);
    let R = parseFloat(RInput.value);
    let angle = parseFloat(angleInput.value) * Math.PI / 180;
    
    trajectory = [];
    speedChartData = [];
    speedChartData.push({x: 0, y: v})
    
    let pre = 
    {
        position:
        {
            x: -R,
            y: 0
        },
        v: 
        {
            x: v * Math.cos(angle),
            y: v * Math.sin(angle),
        }
    }

    drawPoint(prepareCoordinates({x: -R, y: 0}));
    drawPoint(prepareCoordinates({x: 0, y: 0}));
    
    let animation = setInterval(() =>
    {
        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

        let current;


        current = calculate(pre, dt, m, q, Q, R);

        trajectory.push(prepareCoordinates(current.position));

        let speed = Math.sqrt(current.v.x * current.v.x + current.v.y * current.v.y);
        speedChartData.push({x: t, y: speed})
        

        drawPoint(prepareCoordinates(current.position));
        drawPoint(prepareCoordinates({x: 0, y: 0}));
        drawLine(trajectory);
        ctx.fillText(`t = ${t.toFixed(2)} c`, 40, 40);
        

        if (current.position.y == -5 || current.position.y == 5 || 
            current.position.x == -5 || current.position.x == 5)
        {
            clearInterval(animation);
            runButton.disabled = false;
            trButton.disabled = false;
            stopButton.disabled = true;
        }

        pre = current;
        t += dt;
    }, 10);
    stopButton.addEventListener("click", () =>
    {
        clearInterval(animation);
        trButton.disabled = false;
        runButton.disabled = false;
        stopButton.disabled = true;
    });
}

function drawChart1(labels, dataset, context)
{
    if (ch1 != null)
        ch1.destroy();
    ch1 = new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'mv^2',
                backgroundColor: "#ff6361",
                borderColor: "#ff6361",
                data: dataset,
                fill: false,
            }]
        },
        options: {
            responsive: false,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 't, с'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'mv^2, Дж'
                    }
                }]
            }
        }
    });
}

function drawChart2(labels, dataset, context)
{
    if (ch2 != null)
        ch2.destroy();
    ch2 = new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'a/r',
                backgroundColor: "#58508d",
                borderColor: "#58508d",
                data: dataset,
                fill: false,
            }]
        },
        options: {
            responsive: false,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 't, с'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'a/r, Дж'
                    }
                }]
            }
        }
    });
}

stopButton.disabled = true;

drawPoint(prepareCoordinates({x: -1, y: 0}));
drawPoint(prepareCoordinates({x: 0, y: 0}));

runButton.addEventListener("click", () => 
{
    if(!check())
        return;

    runButton.disabled = true;
    trButton.disabled = true;
    stopButton.disabled = false;
    animate();
    
});


trButton.addEventListener("click", () => 
{
    if(!check())
        return;

    runButton.disabled = true;
    trButton.disabled = true;
    
    let dt = 0.02;
    let t = dt;
    let v = parseFloat(vInput.value);
    let m = parseFloat(mInput.value);
    let q = parseFloat(qInput.value);
    let Q = parseFloat(QInput.value);
    let R = parseFloat(RInput.value);
    let angle = parseFloat(angleInput.value) * Math.PI / 180;
    
    trajectory = [];
    let time = [];
    let kinetic = [];
    let potential = [];

    let pre = 
    {
        position:
        {
            x: -R,
            y: 0
        },
        v: 
        {
            x: v * Math.cos(angle),
            y: v * Math.sin(angle),
        }
    }

    for (let i = 0; i < 1001; ++i)
    {
        let current = calculate(pre, dt, m, q, Q, R);
        trajectory.push(prepareCoordinates(current.position));
        
        if (i % 25 == 0)
        {
            time.push((i / 50).toFixed(2));
            
            let v = Math.sqrt(pre.v.x * pre.v.x + pre.v.y * pre.v.y);
            let e = (m * v * v / 2);
            kinetic.push(e);

            let r = distance(pre.position, {x : 0, y: 0});
            let a =
            {
                x: current.v.x - pre.v.x,
                y: current.v.y - pre.v.y
            };
            a = Math.sqrt(a.x * a.x + a.y * a.y);
            let u = (a / r);
            potential.push(u);
        }

        pre = current;

        if (current.position.y == -5 || current.position.y == 5 || 
            current.position.x == -5 || current.position.x == 5)
        {
            break;
        }
    }

    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    drawPoint(prepareCoordinates({x: -R, y: 0}));
    drawPoint(prepareCoordinates({x: 0, y: 0}));
    drawLine(trajectory);
    drawChart1(time, kinetic, chart1.getContext("2d"));
    drawChart2(time, potential, chart2.getContext("2d"));


    runButton.disabled = false;
    trButton.disabled = false;
});