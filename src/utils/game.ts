const GRID_SIZE = 4

export class Game2048 {
  grid: (number | null)[][]
  score: number
  bestScore: number
  gameOver: boolean
  won: boolean

  constructor(bestScore: number = 0) {
    this.grid = this.createEmptyGrid()
    this.score = 0
    this.bestScore = bestScore
    this.gameOver = false
    this.won = false
    this.addRandomTile()
    this.addRandomTile()
  }

  createEmptyGrid() {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  }

  getEmptyTiles() {
    const empty: { row: number, col: number }[] = []
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (this.grid[row][col] === null) {
          empty.push({ row, col })
        }
      }
    }
    return empty
  }

  addRandomTile() {
    const empty = this.getEmptyTiles()
    if (empty.length === 0) return
    const { row, col } = empty[Math.floor(Math.random() * empty.length)]
    this.grid[row][col] = Math.random() < 0.9 ? 2 : 4
  }

  slide(row: (number | null)[]) {
    let arr = row.filter(val => val !== null) as number[]
    let missing = GRID_SIZE - arr.length
    let zeros = Array(missing).fill(null)
    return zeros.concat(arr)
  }

  combine(row: (number | null)[]) {
    for (let i = GRID_SIZE - 1; i > 0; i--) {
      let a = row[i]
      let b = row[i - 1]
      if (a === b && a !== null) {
        row[i] = a * 2
        this.score += a * 2
        if (this.score > this.bestScore) {
          this.bestScore = this.score
        }
        if (row[i] === 2048 && !this.won) {
          this.won = true
        }
        row[i - 1] = null
      }
    }
    return row
  }

  copyGrid(grid: (number | null)[][]) {
    return grid.map(row => [...row])
  }

  compareGrids(a: (number | null)[][], b: (number | null)[][]) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (a[i][j] !== b[i][j]) {
          return true
        }
      }
    }
    return false
  }

  rotateGrid() {
    let newGrid = this.createEmptyGrid()
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = this.grid[col][row]
      }
    }
    this.grid = newGrid
  }

  reverseGrid() {
    for (let row = 0; row < GRID_SIZE; row++) {
      this.grid[row].reverse()
    }
  }

  moveRight() {
    let pastGrid = this.copyGrid(this.grid)
    for (let row = 0; row < GRID_SIZE; row++) {
      this.grid[row] = this.slide(this.grid[row])
      this.grid[row] = this.combine(this.grid[row])
      this.grid[row] = this.slide(this.grid[row])
    }
    if (this.compareGrids(pastGrid, this.grid)) {
      this.addRandomTile()
      this.checkGameOver()
    }
  }

  moveLeft() {
    this.reverseGrid()
    this.moveRight()
    this.reverseGrid()
  }

  moveUp() {
    this.rotateGrid()
    this.reverseGrid()
    this.moveRight()
    this.reverseGrid()
    this.rotateGrid()
  }

  moveDown() {
    this.rotateGrid()
    this.moveRight()
    this.rotateGrid()
  }

  checkGameOver() {
    if (this.getEmptyTiles().length > 0) {
      return false
    }
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (col < GRID_SIZE - 1 && this.grid[row][col] === this.grid[row][col + 1]) {
          return false
        }
        if (row < GRID_SIZE - 1 && this.grid[row][col] === this.grid[row + 1][col]) {
          return false
        }
      }
    }
    this.gameOver = true
    return true
  }

  reset() {
    this.grid = this.createEmptyGrid()
    this.score = 0
    this.gameOver = false
    this.won = false
    this.addRandomTile()
    this.addRandomTile()
  }
}
