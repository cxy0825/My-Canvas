let time = null; //用来存放定时器的返回值
let alist = []; //用来存放实例
let list = []; //存放要绘制的数据的大小
let listTip = ["第一", "第二", "第三", "第四", "第五", "第六", "第七", "第八"];
let bigsize = 240;
let bisesize = 200;
let num = 5; //请求的数量
let temp = "";
let canvas = document.querySelector(".canvas");
let ctx = canvas.getContext("2d");
ctx.fillStyle = "red";
ctx.textAlgin = "center";
ctx.font = "24px 微软雅黑";
ctx.fillText("正在获取数据中....", canvas.width / 2 - 80, canvas.height / 2);

getdata();

//从服务器获得数据
function getdata() {
  fetch("http://101.132.242.117/api/rand.php?num=" + num + "", {
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      let sum = 0;
      //计算总和
      res.forEach((value, i) => {
        sum += value;
        //计算百分比保留小数点后三位
        if (i == res.length - 1) {
          res.forEach((value2, i2) => {
            res[i2] = (value2 / sum).toFixed(3);
          });
        }
      });
      list = res;
    })
    .then(() => {
      arc();
      draw();
      canvas.addEventListener("mousemove", move);
      canvas.onclick = function (e) {
        let index = ispos(e, this);
        temp = alist[index].color;
        alist[index].color = "rgb(255,0,0)";
        ctx.clearRect(0, 0, 10000, 10000);
        draw();
        alist[index].color = temp;
      };
    });
}
//创建一个绘画扇形的类
class _arc {
  constructor(x, y, r, star, end) {
    //鼠标是否在图形内 true表示正在变大，false表示变大后进行缩小
    this.flag = false;
    this.x = x;
    this.y = y;
    this.r = r;
    this.star = star;
    this.end = end;
    this.color =
      "rgb(" +
      Math.floor(Math.random() * 256) +
      "," +
      Math.floor(Math.random() * 256) +
      "," +
      Math.floor(Math.random() * 256) +
      ")";
  }
  arc() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.r, this.star, this.end, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  rect() {
    ctx.beginPath();
    ctx.fillRect(10, 20 + 50 * this.index, 60, 40);
    ctx.font = "24px 微软雅黑";
    ctx.fillText(listTip[this.index], 80, 50 + 50 * this.index);
  }
  line() {
    ctx.beginPath();
    //旋转然后划线
    let rotate = (this.end - this.star).toFixed(2);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.star + rotate / 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(300, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.restore();
    //写字
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.star + rotate / 2);
    ctx.translate(310, 0);
    ctx.rotate(-this.star - rotate / 2);
    ctx.font = "30px 微软雅黑";
    ctx.fillText(listTip[this.index], 10, 20);
    ctx.restore();
  }
}

//创建元素的个数
function arc() {
  let star = 0;
  for (let i = 0; i < list.length; i++) {
    let end = Math.PI * 2 * list[i];
    let a = new _arc(500, 500, bisesize, star, end + star);
    star += end;
    // 添加编号
    a.index = i;
    a.title = (list[i] * 100).toFixed(1) + "%";
    alist.push(a);
  }
}
//绘制元素
function draw() {
  ctx.clearRect(0, 0, 10000, 10000);
  alist.forEach((value) => {
    value.arc();
    value.rect();
    value.line();
  });
}

//鼠标是否在元素内部
function ispos(e) {
  //获取这个位置的像素rgb值，如果颜色值一样就说明鼠标在元素内
  let img = ctx.getImageData(e.offsetX * 2, e.offsetY * 2, 1, 1);
  //过滤背景色黑色
  if (img.data[0] != 0 && img.data[1] != 0 && img.data[2] != 0) {
    //如果获取到的颜色和对象的颜色一样，那么就说明鼠标在元素内
    let rgb =
      "rgb(" + img.data[0] + "," + img.data[1] + "," + img.data[2] + ")";
    for (let i = 0; i < alist.length; i++) {
      if (rgb == alist[i].color) {
        return i;
      }
    }
  }
  //获取到的都是0表示鼠标移出了物体
  else if (img.data[0] == 0 && img.data[1] == 0 && img.data[2] == 0) {
    return -1;
  }
}
//鼠标移动事件
function move(e) {
  //是否在元素内部
  let index = ispos(e);
  //鼠标移入
  change(index, e.offsetX, e.offsetY, this);
}

//改变
function change(i, x, y, _this) {
  if ((i != -1 || i != undefined) && i >= 0 && alist[i].flag == false) {
    //停止动画
    clearInterval(time);
    alist.forEach((value) => {
      value.flag = false;
      value.r = bisesize;
    });
    alist[i].flag = true;
    //变大
    big(i, x, y);
  } else if (i == -1 || i == undefined) {
    //变成鼠标
    canvas.style.cursor = "auto";
    alist.forEach((value, i) => {
      if (value.r > bisesize) {
        //停止动画
        clearInterval(time);
        //重新设定flag
        value.flag = false;
        ctx.clearRect(0, 0, 10000, 10000);
        value.r = bisesize;
        draw();
      }
    });
  }
}

//变大 并且相似提示信息
function big(i, x, y, _this) {
  //变成小手
  canvas.style.cursor = "pointer";
  time = setInterval(() => {
    alist[i].r = alist[i].r + (bigsize - 70) / 10;
    ctx.clearRect(0, 0, 10000, 10000);
    temp = alist[i].color;
    draw();
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.fillRect(x * 2 + 20, y * 2, 100, 40);
    ctx.fillStyle = "white";
    ctx.font = "26px 微软雅黑";
    ctx.fillText(alist[i].title, x * 2 + 30, y * 2 + 30);
    // 限制变大的幅度
    if (alist[i].r >= bigsize) {
      alist[i].r = bigsize;
      clearInterval(time);
    }
  }, 18);
}
