<template>
  <div>
    <canvas width="600" height="600" ref="canvas" class="canvas"></canvas>
  </div>
</template>
<script>
/** @type {HTMLCanvasElement} */
let canvas;
export default {
  name: "mycanvas",
  data() {
    return {
      alist: [], //用来存放实例
      list: [0.2, 0.2, 0.3, 0.3], //存放要绘制的数据的大小
      listTip: ["第一", "第二", "第三", "第四"],
      bigsize: 80,
      num: 5, //请求的数量
    };
  },
  methods: {
    getdata() {
      fetch("http://101.132.242.117/api/rand.php?num=" + this.num + "", {
        method: "GET",
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          this.list = res;
          console.log(this.list);
        });
    },
    //创建一个绘画扇形的类
    _creatarc(ctx, arr) {
      let a = arr;
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
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.arc(this.x, this.y, this.r, this.star, this.end, false);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }
      return new _arc();
    },
  },
  created() {
    //获取数据
    //this.getdata();
  },
  mounted() {
    let time;
    let bigsize = this.bigsize;
    let that = this;
    canvas = this.$refs.canvas;
    let ctx = canvas.getContext("2d");

    let star = 0;
    //创建元素的个数
    for (let i = 0; i < this.list.length; i++) {
      let a;
      let end = Math.PI * 2 * this.list[i];
      a = this._creatarc(ctx, [300, 300, 70, star, end + star]);
      star = star + end;
      // 添加编号
      a.index = i;
      that.alist.push(a);
    }
    //绘制元素
    function draw() {
      that.alist.forEach((value) => {
        value.arc();
      });
    }
    //鼠标在哪个元素的内部，如果没有返回-1
    function ispos(e) {
      //获取这个位置的像素rgb值，如果颜色值一样就说明鼠标在元素内
      let img = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
      //过滤背景色黑色
      if (img.data[0] != 0 && img.data[1] != 0 && img.data[2] != 0) {
        //如果获取到的颜色和对象的颜色一样，那么就说明鼠标在元素内
        let rgb =
          "rgb(" + img.data[0] + "," + img.data[1] + "," + img.data[2] + ")";
        for (let i = 0; i < that.alist.length; i++) {
          if (rgb == that.alist[i].color) {
            return i;
          }
        }
      }
      //获取到的都是0表示鼠标移出了物体
      else if (img.data[0] == 0 && img.data[1] == 0 && img.data[2] == 0) {
        return -1;
      }
    }
    //改变 两个基础大小变量
    function change(i, x, y) {
      if (
        (i != -1 || i != undefined) &&
        i >= 0 &&
        that.alist[i].flag == false
      ) {
        //停止动画
        clearInterval(time);
        that.alist.forEach((value) => {
          value.flag = false;
          value.r = 70;
        });
        that.alist[i].flag = true;
        //变大
        big(i, x, y);
      } else if (i == -1 || i == undefined) {
        //变成鼠标
        canvas.style.cursor = "auto";
        that.alist.forEach((value, i) => {
          if (value.r > 70) {
            //停止动画
            clearInterval(time);
            //重新设定flag
            value.flag = false;
            ctx.clearRect(0, 0, 10000, 10000);
            value.r = 70;
            draw();
          }
        });
      }
    }
    //变大 变成90px
    function big(i, x, y) {
      //变成小手
      canvas.style.cursor = "pointer";
      time = setInterval(() => {
        that.alist[i].r = that.alist[i].r + (bigsize - 70) / 10;
        ctx.clearRect(0, 0, 10000, 10000);
        draw();
        ctx.fillStyle = "rgba(0,0,0,.2)";
        ctx.fillRect(x + 20, y, 60, 30);
        ctx.fillStyle = "white";
        ctx.font = "16px 微软雅黑";
        ctx.fillText(that.listTip[i], x + 30, y + 20);
        if (that.alist[i].r >= bigsize) {
          that.alist[i].r = bigsize;
          clearInterval(time);
        }
      }, 18);
    }
    draw();
    canvas.addEventListener("mousemove", move);
    //鼠标移动事件
    function move(e) {
      //是否在元素内部
      let index = ispos(e);
      change(index, e.offsetX, e.offsetY);
    }
  },
};
</script>
<style lang="css">
.canvas {
  border: 1px solid royalblue;
  background-color: rgb(255, 255, 255);
  width: 600px;
  height: 600px;
}
</style>
