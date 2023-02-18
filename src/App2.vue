<template>
  <div id="app">
    <div class="main-area">
      <button @click="restart">{{ btnContent }}</button>
      <div class="game-area">
        <div v-for="(row,m) in minesArray" :key="m" class="row-cells">
          <div v-for="(cell,n) in row" :key="n" class="cell" @click="clickCell(m,n)">
            {{ cell }}
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

/**
 * @description 格子属性
 */
class Cell {
  constructor(row, col) {
    this.row = row
    this.col = col
    /**
     * @des 隐藏状态
     * @type {boolean}
     */
    this.isVisited = false
    /**
     * @des 插旗
     * @type {boolean}
     */
    this.isFlagged = false
    this.cell = ''
    this.val = 0
    this.neighbors = []
  }
}

export default {
  name: 'App',
  components: {
    // MineClearing
  },
  data() {
    return {
      /**
       * @description 每一局游戏第一次点击格子
       */
      isFirstClick: true,

      /**
       * @description 数组
       */
      mines: [],

      /**
       * @description 格子数组
       */
      cellMatrix: null,

      /**
       * @description 每一局游戏第一次点击格子
       */
      isGameOver: false,

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
       * @description 按键
       */
      btnContent: 'Start',

      /**
       * @description 难度
       */
      difficulty: 'easy'
    }
  },
  mounted() {
    // 初始化游戏
    console.log('-----------------------')
    console.log('初始化游戏中...')

    this.initGame()

    console.log('游戏初始化完成')
    console.log('-----------------------')
  },
  methods: {
    /**
     * @description 获取格子
     * @param r
     * @param c
     * @returns {*}
     */
    getCell(r, c) {
      /* 为了解放双手 */
      return this.cellMatrix[r][c]
    },

    /**
     * @description 第一次点击格子
     * @param cell 点击的X坐标
     */
    clickCell(cell) {
      if (cell.isVisited || cell.isFlagged || this.isGameOver) {
        return
      }

      if (this.isFirstClick) {
        this.noMineBlocks = this.colSize * this.rowSize - this.mineSize
        this.initMines(cell.row, cell.col)
        this.timeStart()
      }

      cell.isVisited = true

      if (cell.val === -1) {
        // 踩雷了，爆炸
        cell.isClickedBoom = true
        this.fail()
        return
      }

      if (cell.val === 0) {
        // 踩空了
        this.search(cell)
      } else {
        cell.cell = cell.val
      }

      // 注意这个，判断胜利的位置放到了最后
      if (--this.noMineBlocks === 0) {
        this.success()
      }
    },

    /**
     * @description 踩空后进行搜索，查询周围格子数字
     * @param cell
     */
    search(cell) {
      /* 因为有了 neighbors，代码简化了许多 */
      cell.neighbors.forEach((neighbor) => {
        this.clickCell(neighbor)
      })
    },

    /**
     * @description 失败结局
     */
    fail() {
      this.gameover()
      this.btnContent = 'BadEnding'
      this.showMines(false)
    },

    /**
     * @description 胜利结局
     */
    success() {
      this.gameover()
      this.btnContent = 'HappyEnding'
      this.showMines(true)
    },

    /**
     * @description 游戏结束
     */
    gameover() {
      this.timeStop()
      this.isGameOver = true
    },

    /**
     * @description 结束时显示地雷
     * @param isSuccess 是否成功
     */
    showMines(isSuccess) {
      this.mines.forEach((cell) => {
        if (isSuccess) {
          // cell.isFlagged = true;
          // cell.val = -2
          if (!cell.isFlagged) {
            console.log('flag')
            this.setFlag(cell)
          }
        } else {
          // if (!cell.isFlagged) cell.isVisited = true;
          // cell.isVisited = true
          if (!cell.isFlagged) cell.isVisited = true
        }
      })
    },

    /**
     * @description 重新开始
     */
    onRestartBtnClick() {
      this.btnContent = 'Start'
      this.restart()
    },

    /**
     * @description 重新开始
     */
    restart() {
      console.log('重新开始')
      this.timeStop()
      this.initGame()
    },
    /**
     * @description 初始化游戏
     */
    initGame() {
      this.isFirstClick = true
      this.isGameOver = false
      if (this.timer) {
        this.timeStop()
      }
      this.mines = []
      this.timer = ''
      this.time = 0.0
      this.remainMines = this.mineSize

      // 初始化二维数组
      this.cellMatrix = []
      for (let row = 0; row < this.rowSize; row++) {
        this.cellMatrix.push([])
        for (let col = 0; col < this.colSize; col++) {
          this.cellMatrix[row].push(new Cell(row, col))
        }
      }
      console.log('this.cellMatrix', this.cellMatrix)
      // 把 '邻居们' 存进来
      this.cellMatrix.forEach((rowArr) => {
        console.log('rowArr', rowArr)
        rowArr.forEach((cell) => {
          posArr.forEach((p) => {
            const x = p[0] + cell.row
            const y = p[1] + cell.col
            if (x >= 0 && x < this.rowSize && y >= 0 && y < this.colSize) {
              const cellNeighbors = []
              cellNeighbors.push(this.getCell(x, y))
              cell.neighbors = JSON.parse(JSON.stringify(cellNeighbors))
            }
          })
        })
      })
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
          this.getCell(mineRow, mineCol).val === -1)

        this.getCell(mineRow, mineCol).val = -1
        this.mines.push(this.getCell(mineRow, mineCol))
      }
      // 初始化数字
      this.initNum()
      console.log('初始化地雷完成...')
      console.log('-----------------------')
      this.isFirstClick = false

      this.cellMatrix.forEach((rowArr) => {
        rowArr.forEach((cell) => {
          if (cell.val === -1) {
            cell.neighbors.forEach((neighbor) => {
              if (neighbor.val !== -1) {
                neighbor.val++
              }
            })
          }
        })
      })
      this.isFirstClick = false
    },

    /**
     * @description 初始化数字
     */
    initNum() {
      console.log('初始化数字...')

      this.cellMatrix.forEach((rowArr) => {
        rowArr.forEach((cell) => {
          if (cell.val === -1) {
            cell.neighbors.forEach((neighbor) => {
              if (neighbor.val !== -1) {
                neighbor.val++
              }
            })
          }
        })
      })
    },

    /**
     * @description 插旗
     */
    setFlag(cell) {
      cell.isFlagged = !cell.isFlagged;
      if (cell.isFlagged) {
        this.remainMines--;
      } else {
        this.remainMines++;
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
          this.rowSize = 8;
          this.colSize = 8;
          this.mineSize = 10;
          break;
        }
        case 'normal': {
          this.rowSize = 16;
          this.colSize = 16;
          this.mineSize = 40;
          break;
        }
        case 'hard': {
          this.rowSize = 16;
          this.colSize = 30;
          this.mineSize = 99;
          break;
        }
      }
      this.initGame();
    },


    mousedown(e, cell) {
      if (e.button === 2) {
        if (!cell.isVisited) this.setFlag(cell)
        cell.isRightPress = true
      } else if (e.button === 0) {
        cell.isLeftPress = true
        cell.isReady = true
      }
      // 同时按下
      if (cell.isRightPress && cell.isLeftPress) {
        cell.neighbors.forEach((neighbor) => {
          if (!neighbor.isFlagged) neighbor.isReady = true
        })
        cell.isReady = true
        return
      }

      // console.log(e.button);
      this.emojiType = "click"
    },

    mouseup(e, cell) {
      this.emojiType = "default"
      let clear = false

      // 同时按下后，有一个松开
      if (cell.isLeftPress && cell.isRightPress) {
        if (cell.val > 0 && cell.isVisited) {
          let unVisitedCells = []
          let flags = 0

          cell.neighbors.forEach((neighbor) => {
            if (neighbor.isFlagged) {
              // console.log(neighbor)
              flags++
            }
            if (!neighbor.isVisited && !neighbor.isFlagged) {
              unVisitedCells.push(neighbor)
            }
          })

          let mines = []
          if (flags === cell.val) {
            unVisitedCells.forEach((c) => {
              if (c.val === -1) {
                mines.push(c)
              } else {
                this.clickCell(c)
              }
            })
          }
          if (mines.length > 0) {
            mines.forEach((mine) => {
              mine.isVisited = true
              mine.isClickedBoom = true
            })
            this.fail()
          }
        }
      }
      cell.neighbors.forEach((neighbor) => {
        neighbor.isReady = false
      })

      if (e.button === 2) {
        cell.isRightPress = false
      } else if (e.button === 0) {
        cell.isLeftPress = false
      }
    },


    mouseleave(cell) {
      if (cell.isReady) {
        cell.isReady = false;
      }
    }
  },

  /** ------------------------------------------------------------------------ */
  /** ------------------------------------------------------------------------ */

















  filters: {
    /**
     * @description  时间过滤
     * @param val
     * @returns {string}
     */
    timeFilter(val) {
      return Number(val).toFixed(1)
    }
    ,

    /**
     * @description 设置空格
     * @param val 格子数字
     * @returns {string|*}
     */
    cellFilter(val) {
      return val === 0 ? '' : val
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
