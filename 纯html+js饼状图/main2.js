let time = null; //用来存放定时器的返回值
let alist = []; //用来存放实例
let list = []; //存放要绘制的数据的大小
let listTip = [
  "精灵球",
  "大师球",
  "中级球",
  "高级球",
  "橄榄球",
  "深水球",
  "束缚球",
  "洞穴球",
  "国王球",
];
const x = 900;
const y = 900;
let bigsize = 360;
let bisesize = 300;
let num = 5; //请求的数量
let temp = "";
let selectI = -1; //哪一个被选中 -1代表没有被鼠标选中
let canvas = document.querySelector(".canvas");
let ctx = canvas.getContext("2d");
ctx.fillStyle = "red";
ctx.textAlgin = "center";
ctx.font = "24px 微软雅黑";
ctx.fillText("正在获取数据中....", canvas.width / 2 - 80, canvas.height / 2);
//自动执行 随机添加数组
for (let i = 0; i < num; i++) {
  let rand = Math.ceil(Math.random() * 100 + 1);
  listTip.push(rand + "类球");
}

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
      draw(0, 0);
      canvas.addEventListener("mousemove", move);
    });
}
//创建一个绘画扇形的类
class _arc {
  constructor(x, y, r, star, end) {
    //是否被选中
    this.flag = false;
    this.hover = "red";
    this.x = x;
    this.y = y;
    this.r = r;
    this.star = star;
    this.end = end;
    this.color1 =
      "rgb(" +
      Math.floor(Math.random() * 256) +
      "," +
      Math.floor(Math.random() * 256) +
      "," +
      Math.floor(Math.random() * 256) +
      ")";
  }
  arc(x, y) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.r, this.star, this.end, false);
    if (ctx.isPointInPath(x, y)) {
      this.r = bigsize;
      this.color = this.hover;
      canvas.style.cursor = "pointer";
      ctx.fillStyle = this.color;
      ctx.fill();
      //移入显示数字
      ctx.font = "28px 微软雅黑";
      ctx.fillStyle = "rgb(255,255,0)";
      let data = 100 * list[this.index];
      ctx.fillText(
        listTip[this.index] + " " + data.toFixed(2) + "%",
        x - 50,
        y - 10
      );
      //还原填充颜色
      ctx.fillStyle = this.color;
    } else {
      this.r = bisesize;
      this.color = this.color1;
      canvas.style.cursor = "auto";
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  rect() {
    ctx.beginPath();
    ctx.rect(10, 20 + 50 * this.index, 60, 40);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.font = "24px 微软雅黑";
    let data = 100 * list[this.index];
    ctx.fillText(
      listTip[this.index] + "    占" + data.toFixed(2) + "%",
      80,
      50 + 50 * this.index
    );
  }
  line() {
    ctx.beginPath();
    //获取饼状图的弧度大小
    let rotate = (this.end - this.star).toFixed(2);
    //获取饼状图的中心的弧度
    let ro = (this.star + rotate / 2).toFixed(2);
    let x1, y1;
    ctx.moveTo(this.x, this.y);
    y1 = (bisesize + 150) * Math.sin(ro);
    x1 = (bisesize + 150) * Math.cos(ro);
    ctx.lineTo(x1 + this.x, y1 + this.y);
    //第四象限
    if (x1 > 0 && y1 > 0) {
      //绘制指向
      ctx.lineTo(x1 + this.x + 40, y1 + this.y);
      ctx.font = "30px 微软雅黑";
      //绘制文字
      ctx.fillText(listTip[this.index], x1 + this.x + 50, y1 + this.y);
    }
    //第三象限
    else if (x1 < 0 && y1 > 0) {
      ctx.lineTo(x1 + this.x - 40, y1 + this.y);
      ctx.font = "30px 微软雅黑";
      ctx.fillText(listTip[this.index], x1 + this.x - 120, y1 + this.y + 10);
    }
    //第二象限
    else if (x1 < 0 && y1 < 0) {
      ctx.lineTo(x1 + this.x - 40, y1 + this.y);
      ctx.font = "30px 微软雅黑";
      ctx.fillText(listTip[this.index], x1 + this.x - 140, y1 + this.y + 10);
    }
    //第一象限
    else if (x1 > 0 && y1 < 0) {
      ctx.lineTo(x1 + this.x + 40, y1 + this.y);
      ctx.font = "30px 微软雅黑";
      ctx.fillText(listTip[this.index], x1 + this.x + 50, y1 + this.y);
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.stroke();
  }
}

//创建元素的个数
function arc() {
  let star = 0;
  for (let i = 0; i < list.length; i++) {
    let end = Math.PI * 2 * list[i];
    let a = new _arc(x, y, bisesize, star, end + star);
    star += end;
    // 添加编号
    a.index = i;
    a.title = (list[i] * 100).toFixed(1) + "%";
    alist.push(a);
  }
}

//绘制元素
function draw(x, y) {
  ctx.clearRect(0, 0, 10000, 10000);

  alist.forEach((value) => {
    if (x == undefined && y == undefined) {
      value.arc();
    } else {
      value.arc(x, y);
    }
    value.line();
    value.rect(x, y);
    if (x == undefined && y == undefined) {
      value.arc();
    } else {
      value.arc(x, y);
    }
  });
}

//鼠标是否在元素内部
function ispos(e) {
  return {
    x: e.offsetX * 2,
    y: e.offsetY * 2,
  };
}
//鼠标移动事件
function move(e) {
  //是否在元素内部
  let { x, y } = ispos(e);
  draw(x, y);
}
