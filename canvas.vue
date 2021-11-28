<template>
  <div>
    <canvas width="1000" height="1000" ref="canvas" class="canvas"></canvas>
  </div>
</template>
<script>
/** @type {HTMLCanvasElement} */
let canvas;
export default {
  name: "mycanvas",
  data() {
    return {
      ctx: null, //用来存放画笔对象
      time: null, //用来存放定时器的返回值
      alist: [], //用来存放实例
      list: [], //存放要绘制的数据的大小
      listTip: ["第一", "第二", "第三", "第四", "第五", "第六", "第七", "第八"],
      bigsize: 240,
      bisesize: 200,
      num: 5, //请求的数量
      temp: "",
      I: null, //选中的索引
    };
  },
  methods: {
    //从服务器获得数据
    getdata() {
      fetch("http://101.132.242.117/api/rand.php?num=" + this.num + "", {
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
          this.list = res;
        });
    },
    //创建一个绘画扇形的类
    _creatarc(arr) {
      let a = arr;
      let self = this;
      //创建一个绘画扇形的类
      class _arc {
        //  constructor(a, y, r, star, end) {
        constructor(a) {
          //鼠标是否在图形内 true表示正在变大，false表示变大后进行缩小
          this.flag = false;
          this.x = arr[0];
          this.y = arr[1];
          this.r = arr[2];
          this.star = arr[3];
          this.end = arr[4];
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
          self.ctx.beginPath();
          self.ctx.moveTo(this.x, this.y);
          self.ctx.arc(this.x, this.y, this.r, this.star, this.end, false);
          self.ctx.fillStyle = this.color;
          self.ctx.fill();
        }
        rect() {
          self.ctx.beginPath();
          self.ctx.fillRect(10, 20 + 50 * this.index, 60, 40);
          self.ctx.font = "24px 微软雅黑";
          self.ctx.fillText(self.listTip[this.index], 80, 50 + 50 * this.index);
        }
        line() {
          self.ctx.beginPath();
          //旋转然后划线
          let rotate = (this.end - this.star).toFixed(2);
          self.ctx.save();
          self.ctx.translate(this.x, this.y);
          self.ctx.rotate(this.star + rotate / 2);
          self.ctx.moveTo(0, 0);
          self.ctx.lineTo(300, 0);
          self.ctx.lineWidth = 3;
          self.ctx.strokeStyle = this.color;
          self.ctx.stroke();
          self.ctx.restore();
          //写字
          self.ctx.save();
          self.ctx.translate(this.x, this.y);
          self.ctx.rotate(this.star + rotate / 2);
          self.ctx.translate(310, 0);
          self.ctx.rotate(-this.star - rotate / 2);
          self.ctx.font = "30px 微软雅黑";
          self.ctx.fillText(self.listTip[this.index], 10, 20);
          self.ctx.restore();
        }
      }
      return new _arc();
    },
    //创建元素的个数
    arc() {
      let star = 0;
      for (let i = 0; i < this.list.length; i++) {
        let end = Math.PI * 2 * this.list[i];
        let a = this._creatarc([500, 500, this.bisesize, star, end + star]);
        star += end;
        // 添加编号
        a.index = i;
        a.title = (this.list[i] * 100).toFixed(1) + "%";
        this.alist.push(a);
      }
    },
    //绘制元素
    draw() {
      this.ctx.clearRect(0, 0, 10000, 10000);
      this.alist.forEach((value) => {
        value.arc();
        value.rect();
        value.line();
      });
    },
    //鼠标是否在元素内部
    ispos(e) {
      //获取这个位置的像素rgb值，如果颜色值一样就说明鼠标在元素内
      let img = this.ctx.getImageData(e.offsetX * 2, e.offsetY * 2, 1, 1);
      //过滤背景色黑色
      if (img.data[0] != 0 && img.data[1] != 0 && img.data[2] != 0) {
        //如果获取到的颜色和对象的颜色一样，那么就说明鼠标在元素内
        let rgb =
          "rgb(" + img.data[0] + "," + img.data[1] + "," + img.data[2] + ")";
        for (let i = 0; i < this.alist.length; i++) {
          if (rgb == this.alist[i].color) {
            if (i != this.I) {
              this.I = i;
              return i;
            } else {
              return i;
            }
          }
        }
      }
      //获取到的都是0表示鼠标移出了物体
      else if (img.data[0] == 0 && img.data[1] == 0 && img.data[2] == 0) {
        return -1;
      }
    },
    //改变
    change(i, x, y, _this) {
      if (
        (i != -1 || i != undefined) &&
        i >= 0 &&
        _this.alist[i].flag == false
      ) {
        //停止动画
        clearInterval(this.time);
        _this.alist.forEach((value) => {
          value.flag = false;
          value.r = _this.bisesize;
        });
        _this.alist[i].flag = true;

        //变大
        _this.big(i, x, y, _this);
      } else if (i == -1 || i == undefined) {
        //变成鼠标
        canvas.style.cursor = "auto";
        _this.alist.forEach((value, i) => {
          if (value.r > _this.bisesize) {
            //停止动画
            clearInterval(_this.time);
            //重新设定flag
            value.flag = false;
            _this.ctx.clearRect(0, 0, 10000, 10000);
            value.r = _this.bisesize;
            _this.draw();
          }
        });
      }
    },
    //变大 并且相似提示信息
    big(i, x, y, _this) {
      //变成小手
      canvas.style.cursor = "pointer";
      _this.time = setInterval(() => {
        _this.alist[i].r = _this.alist[i].r + (_this.bigsize - 70) / 10;
        _this.ctx.clearRect(0, 0, 10000, 10000);
        _this.draw();
        _this.ctx.fillStyle = "rgba(0,0,0,.4)";
        _this.ctx.fillRect(x * 2 + 20, y * 2, 100, 40);
        _this.ctx.fillStyle = "white";
        _this.ctx.font = "26px 微软雅黑";
        _this.ctx.fillText(_this.alist[i].title, x * 2 + 30, y * 2 + 30);
        // 限制变大的幅度
        if (_this.alist[i].r >= _this.bigsize) {
          _this.alist[i].r = _this.bigsize;
          clearInterval(_this.time);
        }
      }, 10);
    },
  },
  created() {
    //获取数据
    this.getdata();
  },
  mounted() {
    canvas = this.$refs.canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.fillStyle = "red";
    this.ctx.textAlgin = "center";
    this.ctx.font = "15px 微软雅黑";
    this.ctx.fillText(
      "正在获取数据中....",
      canvas.width / 2 - 80,
      canvas.height / 2
    );
    canvas.addEventListener("mousemove", move.bind(this));
    canvas.onclick = c.bind(this);
    //鼠标移动事件
    function move(e) {
      //是否在元素内部
      let index = this.ispos(e, this);
      //鼠标移入
      this.change(index, e.offsetX, e.offsetY, this);
    }
    function c(e) {
      //是否在元素内部
      let index = this.ispos(e, this);
      this.temp = this.alist[index].color;
      this.alist[index].color = "rgb(255,0,0)";
      this.ctx.clearRect(0, 0, 10000, 10000);
      this.draw();
      this.alist[index].color = this.temp;
    }
  },
  watch: {
    list: {
      handler(n, old) {
        this.arc();
        this.draw();
      },
    },
  },
};
</script>
<style lang="css">
* {
  padding: 0;
  margin: 0;
}

.canvas {
  width: 500px;
  height: 500px;
  border: 1px solid royalblue;
  background-color: rgb(255, 255, 255);
}
</style>
