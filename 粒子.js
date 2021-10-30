/** @type {HTMLCanvasElement}  */
let canvas = document.querySelector("#canvas");
canvas.width = 2 * window.innerWidth;
canvas.height = 2 * window.innerHeight;
// canvas.width = 1920;
// canvas.height = 1080;
let ctx = canvas.getContext("2d");
//存放粒子的数组
let lizi = [];
//在200*200的范围内有一个粒子
let count = parseInt((canvas.width / 150) * (canvas.height / 150));

class Lizi {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.directX = 0.5 - Math.random();
    this.directY = 0.5 - Math.random();
  }
  update() {
    this.x += this.directX;
    this.y += this.directY;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

function createLizi() {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  lizi.push(new Lizi(x, y));
}

function handleLizi() {
  for (i = 0; i < lizi.length; i++) {
    let l = lizi[i];
    l.update();
    l.draw();
    if (l.x < 0 || l.x > canvas.width || l.y < 0 || l.y > canvas.height) {
      lizi.splice(i, 1);
    }
    for (let j = i; j < lizi.length; j++) {
      dx = lizi[i].x - lizi[j].x;
      dy = lizi[i].y - lizi[j].y;
      let long = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      if (long < 150) {
        ctx.beginPath();
        ctx.moveTo(lizi[i].x, lizi[i].y);
        ctx.lineTo(lizi[j].x, lizi[j].y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgb(233,233,233," + (1 - long / 160) + ")";
        ctx.stroke();
      }
    }
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (lizi.length < count) {
    createLizi();
  }
  handleLizi();
}
//requestAnimationFrame(animate);这个方法必须先定义在调用
function animate() {
  requestAnimationFrame(animate);
  draw();
}
//调用
animate();
