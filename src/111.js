let posArr = [
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1]
];

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isVisited = false;
    this.isFlagged = false;
    this.cell = "";
    this.val = 0;
    this.neighbors = [];
  }
}

var vm = new Vue({
  el: "#app",
  data: {
    // btnContent: "1",
    isFirstClick: true,
    mines: [],
    cellMatrix: "",
    isGameOver: false,
    colSize: 8,
    rowSize: 8,
    mineSize: 10,
    remainMines: "",
    noMineBlocks: "",
    timer: "",
    time: 0.0,
    difficulty: "easy",
    emojiType: "default"
  },
  methods: {
    getCell(r, c) {
      return this.cellMatrix[r][c];
    },

    clickCell(cell) {
      if (cell.isVisited || cell.isFlagged || this.isGameOver) {
        return;
      }

      if (this.isFirstClick) {
        this.noMineBlocks = this.colSize * this.rowSize - this.mineSize;
        this.initMines(cell.row, cell.col);
        this.timeStart();
      }

      cell.isVisited = true;

      // console.log(this.noMineBlocks);

      if (cell.val === 0) {
        // 踩空了
        this.search(cell);
      } else {
        cell.cell = cell.val;
      }

      if (cell.val === -1) {
        // 踩雷了，爆炸
        cell.isClickedBoom = true;
        this.fail();
        return;
      }

      if (--this.noMineBlocks === 0) {
        this.success();
        return;
      }
    },

    search(cell) {
      cell.neighbors.forEach((neighbor) => {
        this.clickCell(neighbor);
      });
    },

    fail() {
      this.gameover();
      this.showMines(false);
      this.emojiType = "fail";
    },

    success() {
      this.gameover();
      this.showMines(true);
      this.emojiType = "success";
    },

    gameover() {
      this.timeStop();
      this.isGameOver = true;
    },

    showMines(isSuccess) {
      console.log(this.mines);
      this.mines.forEach((cell) => {
        if (isSuccess) {
          if (!cell.isFlagged) {
            console.log("flag");
            this.setFlag(cell);
          }
        } else {
          if (!cell.isFlagged) cell.isVisited = true;
        }
      });
    },

    onRestartBtnClick() {
      this.emojiType = "default";
      this.restart();
    },

    restart() {
      this.timeStop();
      this.initGame();
    },

    initGame() {
      this.isFirstClick = true;
      this.isGameOver = false;
      if (this.timer) {
        this.timeStop();
      }
      this.mines = [];
      this.timer = "";
      this.time = 0.0;
      this.remainMines = this.mineSize;

      this.cellMatrix = [];
      for (let row = 0; row < this.rowSize; row++) {
        this.cellMatrix.push(new Array());
        for (let col = 0; col < this.colSize; col++) {
          this.cellMatrix[row].push(new Cell(row, col));
        }
      }

      this.cellMatrix.forEach((rowArr) => {
        rowArr.forEach((cell) => {
          posArr.forEach((p) => {
            let x = p[0] + cell.row;
            let y = p[1] + cell.col;
            if (x >= 0 && x < this.rowSize && y >= 0 && y < this.colSize) {
              cell.neighbors.push(this.getCell(x, y));
            }
          });
        });
      });
    },

    initMines(row, col) {
      console.log("-----------------------");

      console.log("初始化地雷...");
      // 地雷设为 -1
      for (let i = 0; i < this.mineSize; i++) {
        do {
          var mineRow = Math.floor(Math.random() * this.rowSize);
          var mineCol = Math.floor(Math.random() * this.colSize);
        } while (
          (mineRow === row && mineCol === col) ||
          this.getCell(mineRow, mineCol).val === -1
          );

        this.getCell(mineRow, mineCol).val = -1;
        this.mines.push(this.getCell(mineRow, mineCol));
      }
      // 设定数字标识
      this.initNum();

      console.log("初始化地雷完成...");
      console.log("-----------------------");

      this.isFirstClick = false;
    },

    initNum() {
      console.log("初始化数字...");

      this.cellMatrix.forEach((rowArr) => {
        rowArr.forEach((cell) => {
          if (cell.val === -1) {
            cell.neighbors.forEach((neighbor) => {
              if (neighbor.val !== -1) {
                neighbor.val++;
              }
            });
          }
        });
      });
    },
    setFlag(cell) {
      cell.isFlagged = !cell.isFlagged;
      if (cell.isFlagged) {
        this.remainMines--;
      } else {
        this.remainMines++;
      }
      return;
    },

    timeStart() {
      this.timer = setInterval(() => {
        this.time += 0.1;
      }, 100);
    },
    timeStop() {
      clearInterval(this.timer);
    },

    changeDifficulty() {
      switch (this.difficulty) {
        case "easy": {
          this.rowSize = 8;
          this.colSize = 8;
          this.mineSize = 10;
          break;
        }
        case "normal": {
          this.rowSize = 16;
          this.colSize = 16;
          this.mineSize = 40;
          break;
        }
        case "hard": {
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
        if (!cell.isVisited) this.setFlag(cell);
        cell.isRightPress = true;
      } else if (e.button === 0) {
        cell.isLeftPress = true;
        cell.isReady = true;
      }
      // 同时按下
      if (cell.isRightPress && cell.isLeftPress) {
        cell.neighbors.forEach((neighbor) => {
          if (!neighbor.isFlagged) neighbor.isReady = true;
        });
        cell.isReady = true;
        return;
      }

      // console.log(e.button);
      this.emojiType = "click";
    },

    mouseup(e, cell) {
      this.emojiType = "default";
      let clear = false;

      // 同时按下后，有一个松开
      if (cell.isLeftPress && cell.isRightPress) {
        if (cell.val > 0 && cell.isVisited) {
          let unVisitedCells = [];
          let flags = 0;

          cell.neighbors.forEach((neighbor) => {
            if (neighbor.isFlagged) {
              // console.log(neighbor)
              flags++;
            }
            if (!neighbor.isVisited && !neighbor.isFlagged) {
              unVisitedCells.push(neighbor);
            }
          });

          let mines = [];
          if (flags === cell.val) {
            unVisitedCells.forEach((c) => {
              if (c.val === -1) {
                mines.push(c);
              } else {
                this.clickCell(c);
              }
            });
          }
          if (mines.length > 0) {
            mines.forEach((mine) => {
              mine.isVisited = true;
              mine.isClickedBoom = true;
            });
            this.fail();
          }
        }
      }
      cell.neighbors.forEach((neighbor) => {
        neighbor.isReady = false;
      });

      if (e.button === 2) {
        cell.isRightPress = false;
      } else if (e.button === 0) {
        cell.isLeftPress = false;
      }
    },

    mouseleave(cell) {
      if (cell.isReady) {
        cell.isReady = false;
      }
    }
  },

  mounted() {
    // 初始化游戏
    console.log("-----------------------");
    console.log("初始化游戏中...");

    this.initGame();

    console.log("游戏初始化完成");
    console.log("-----------------------");
  },

  filters: {
    timeFilter(val) {
      return Number(val).toFixed(0);
    },
    cellFilter(val) {
      return val === 0 ? "" : val;
    }
  }
});
