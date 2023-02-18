<template>
  <div id="app">
    <div class="main-area">

      <div style="text-align:center" class="top-box">
        <div class="top-box-item remain-mines show-number">
          {{ mineSize }}
        </div>
        <button @click="restart" class="restart-btn top-box-item">
          {{ btnContent }}
        </button>
        <div class="top-box-item time show-number"> {{ time | timeFilter }}</div>
      </div>
      <div class="game-area">
        <div v-for="(rowArr,m) in minesArray" :key="m" class="row-cells">
          <div
            v-for="(cell,n) in rowArr"
            :key="n" class="cell"
            @click="clickCell(m,n)"
            @contextmenu.prevent="rightClick($event,m,n)"
          >
            <div :class="['num-color-'+minesArray[m][n], 'num-color' ]">
              {{ cell | cellFilter }}
            </div>
            <div :class="['mask', {visited: visited[m][n]}]"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

/**
 * @description 九宫格数组其中除开点击的[0,0]坐标以外的八个格子
 * @type {number[][]}
 */
const posArr = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1]
]
export default {
  name: 'App',

  data() {
    return {
      /**
       * @description 每一局游戏第一次点击格子
       */
      isFirstClick: true,
      /**
       * @description 每一局游戏第一次点击格子
       */
      isGameOver: false,
      /**
       * @description 数组
       */
      minesArray: null,
      /**
       * @description 行数
       */
      rowSize: 8,
      /**
       * @description 列数
       */
      colSize: 8,
      /**
       * @description 地雷数量
       */
      mineSize: 9,
      /**
       * @description 按键
       */
      btnContent: 'Start',
      /**
       * @description 剩余地雷
       */
      remainMines: '',
      /**
       * @description 安全格子数量
       */
      noMineBlocks: '',
      /**
       * @description 计时累加
       */
      time: 0.0,
      /**
       * @description 计时
       */
      timer: '',
      /**
       * @description 难度
       */
      difficulty: 'easy',

      visited: null,
      flag: '',
      flagType: false
    }
  },
  mounted() {
    // 初始化游戏
    console.log('-----------------------')
    console.log('初始化游戏中...')
    this.minesArray = []
    this.visited = []
    for (let i = 0; i < this.rowSize; i++) {
      this.minesArray[i] = []
      this.visited[i] = []
      for (let j = 0; j < this.colSize; j++) {
        this.minesArray[i][j] = 0
        this.visited[i][j] = false
      }
    }
    console.log('游戏初始化完成')
    console.log('-----------------------')
  },
  methods: {
    /**
     * @description 第一次点击格子
     * @param row 点击的X坐标
     * @param col 点击的Y坐标
     */
    clickCell(row, col) {
      if (this.visited[row][col] || this.isGameOver) {
        return
      }
      if (this.isFirstClick) {
        this.noMineBlocks = this.colSize * this.rowSize - this.mineSize
        this.initMines(row, col)
        this.timeStart()
      }
      this.visited[row][col] = true
      this.$set(this.visited, row, [...this.visited[row]])

      const cell = this.minesArray[row][col]
      if (cell === -1) {
        // 踩雷了，爆炸
        this.fail()
        return
      }
      if (--this.noMineBlocks === 0) {
        //  安全格子全部点完，起飞
        this.success()
        return
      }
      if (cell === 0) {
        // 踩空了
        this.search(row, col)
      }
    },

    /**
     * @description  传入第一次点击的坐标
     * @param row 第一次点击的X坐标
     * @param col 第一次点击的Y坐标
     */
    initMines(row, col) {
      console.log('-----------------------')
      console.log('初始化地雷...')
      // 地雷设为 -1
      for (let i = 0; i < this.mineSize; i++) {
        do {
          var mineRow = Math.floor(Math.random() * this.rowSize)
          var mineCol = Math.floor(Math.random() * this.colSize)
        } while (
          (mineRow === row && mineCol === col) ||
          this.minesArray[mineRow][mineCol] === -1)
        this.minesArray[mineRow][mineCol] = -1
        this.$set(this.minesArray, mineRow, [...this.minesArray[mineRow]])
      }
      // 初始化数字
      this.initNum()
      console.log('初始化地雷完成...')
      console.log('-----------------------')
      const borderX = this.minesArray.length
      const borderY = this.minesArray[0].length
      for (let i = 0; i < this.minesArray.length; i++) {
        for (let j = 0; j < this.minesArray[i].length; j++) {
          // 如果是雷，雷周围 8 个格子除了地雷数字加 1
          if (this.minesArray[i][j] === -1) {
            posArr.forEach((pos) => {
              const x = pos[0] + i
              const y = pos[1] + j
              if (x < borderX && x >= 0 && y < borderY && y >= 0) {
                if (this.minesArray[x][y] !== -1) {
                  this.minesArray[x][y]++
                }
              }
            })
          }
        }
      }

      this.isFirstClick = false
    },
    /**
     * @description 踩空后进行搜索，查询周围格子数字
     * @param r  X
     * @param c  Y
     */
    search(r, c) {
      posArr.forEach((pos) => {
        const x = pos[0] + r
        const y = pos[1] + c
        if (
          x < this.visited.length &&
          x >= 0 &&
          y < this.visited[0].length &&
          y >= 0 &&
          !this.visited[x][y]
        ) {
          // 若未访问过
          this.clickCell(x, y)
        }
      })
    },

    /**
     * @description 失败结局
     */
    fail() {
      this.timeStop()
      this.isGameOver = true
      this.btnContent = 'Fail'
      this.showMines(false)
    },

    /**
     * @description 胜利结局
     */
    success() {
      this.timeStop()
      this.isGameOver = true
      this.btnContent = 'Success'
      this.showMines(true)
    },

    /**
     * @description 游戏结束
     */
    gameover() {

    },

    /**
     * @description 结束时显示地雷
     * @param isSuccess 是否成功
     */
    showMines(isSuccess) {
      for (let i = 0; i < this.minesArray.length; i++) {
        for (let j = 0; j < this.minesArray[0].length; j++) {
          if (this.minesArray[i][j] === -1) {
            if (isSuccess) {
              this.minesArray[i][j] = -2 // 插旗
            }
            this.$set(this.minesArray, i, [...this.minesArray[i]])

            this.visited[i][j] = true
          }
        }
      }
    },

    /**
     * @description 重新开始
     */
    onRestartBtnClick() {
      this.timeStop()
    },

    /**
     * @description 重新开始
     */
    restart() {
      this.timeStop()
      this.isFirstClick = true
      this.isGameOver = false
      this.btnContent = 'Restart'
      this.mineSize = 9
      this.timer = ''
      this.time = 0.0
      this.initCells()
      this.initVisited()
    },

    initCells() {
      console.log('-----------------------')
      console.log('初始化方格...')
      for (let i = 0; i < this.rowSize; i++) {
        for (let j = 0; j < this.colSize; j++) {
          this.minesArray[i][j] = 0
          this.$set(this.minesArray, i, [...this.minesArray[i]])
        }
      }
      console.log('初始化方格结束')
      console.log('-----------------------')
    },
    initVisited() {
      for (let i = 0; i < this.rowSize; i++) {
        for (let j = 0; j < this.colSize; j++) {
          this.visited[i][j] = false
          this.$set(this.visited, i, [...this.visited[i]])
        }
      }
    },

    /**
     * @description 初始化数字
     */
    initNum() {

    },

    /**
     * @description 插旗
     */
    setFlag(cell) {
      cell.isFlagged = !cell.isFlagged
      if (cell.isFlagged) {
        this.remainMines--
      } else {
        this.remainMines++
      }
    },
    /**
     * @description 计时开始
     */
    timeStart() {
      this.timer = setInterval(() => {
        this.time += 0.1
      }, 100)
    },

    /**
     * @description 计时停止
     */
    timeStop() {
      clearInterval(this.timer)
    },
    /**
     * @description 选择难度
     */
    changeDifficulty() {
      switch (this.difficulty) {
        case 'easy': {
          this.rowSize = 8
          this.colSize = 8
          this.mineSize = 10
          break
        }
        case 'normal': {
          this.rowSize = 16
          this.colSize = 16
          this.mineSize = 40
          break
        }
        case 'hard': {
          this.rowSize = 16
          this.colSize = 30
          this.mineSize = 99
          break
        }
      }
      this.initGame()
    },

    /**
     * @description 右键事件
     * @param e
     * @param m X
     * @param n Y
     */
    rightClick(e, m, n) {
      // 鼠标右击触发事件
      const eee = e

      if (!(eee !== e)) {
        this.flag += 1
        this.mineSize -= 1
        eee.target.innerHTML = '旗'
        if (this.flag === this.mineSize || this.noMineBlocks === this.mineSize) {
          this.success()
        }
      }
      console.log('空', this.noMineBlocks)
      console.log('雷', this.mineSize)
      console.log('eeee', this.flag)
    }
  },
  filters: {
    /**
     * @description  时间过滤
     * @param val
     * @returns {string}
     */
    timeFilter(val) {
      return Number(val).toFixed(1)
    },
    /**
     * @description 设置空格
     * @param val 格子数字
     * @returns {string|*}
     */
    cellFilter(val) {
      if (val === 0) {
        return ''
      } else if (val === -1) {
        return '炸'
      } else if (val === -2) {
        return '弹'
      } else {
        return val
      }
      // return val === 0 ? '' : val
    }
  }

}
</script>

<style>
@import "./assets/style/Index.css";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
