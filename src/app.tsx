import { useState, useEffect, useCallback } from 'react'

const GRID_SIZE = 4

const getTileStyle = (value: number | null) => {
  const styleMap: Record<number, { background: string; color: string; fontSize: string }> = {
    2: { background: '#eee4da', color: '#776e65', fontSize: '48px' },
    4: { background: '#ede0c8', color: '#776e65', fontSize: '48px' },
    8: { background: '#f2b179', color: '#f9f6f2', fontSize: '48px' },
    16: { background: '#f59563', color: '#f9f6f2', fontSize: '48px' },
    32: { background: '#f67c5f', color: '#f9f6f2', fontSize: '48px' },
    64: { background: '#f65e3b', color: '#f9f6f2', fontSize: '48px' },
    128: { background: '#edcf72', color: '#f9f6f2', fontSize: '40px' },
    256: { background: '#edcc61', color: '#f9f6f2', fontSize: '40px' },
    512: { background: '#edc850', color: '#f9f6f2', fontSize: '40px' },
    1024: { background: '#edc53f', color: '#f9f6f2', fontSize: '32px' },
    2048: { background: '#edc22e', color: '#f9f6f2', fontSize: '32px' },
    4096: { background: '#3c3a32', color: '#f9f6f2', fontSize: '28px' },
    8192: { background: '#3c3a32', color: '#f9f6f2', fontSize: '28px' }
  }
  if (value && styleMap[value]) return styleMap[value]
  return { background: '#cdc1b4', color: '#776e65', fontSize: '48px' }
}

const createEmptyGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))

function App() {
  const [grid, setGrid] = useState<(number | null)[][]>(createEmptyGrid())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('bestScore') || '0')
  })
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const addRandomTile = useCallback((currentGrid: (number | null)[][]) => {
    const empty: { row: number; col: number }[] = []
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentGrid[row][col] === null) {
          empty.push({ row, col })
        }
      }
    }
    if (empty.length === 0) return currentGrid
    const { row, col } = empty[Math.floor(Math.random() * empty.length)]
    const newGrid = currentGrid.map(r => [...r])
    newGrid[row][col] = Math.random() < 0.9 ? 2 : 4
    return newGrid
  }, [])

  const slide = useCallback((row: (number | null)[]) => {
    let arr = row.filter(val => val !== null) as number[]
    let missing = GRID_SIZE - arr.length
    return Array(missing).fill(null).concat(arr)
  }, [])

  const combine = useCallback((row: (number | null)[]) => {
    let addScore = 0
    for (let i = GRID_SIZE - 1; i > 0; i--) {
      let a = row[i]
      let b = row[i - 1]
      if (a === b && a !== null) {
        row[i] = a * 2
        addScore += a * 2
        row[i - 1] = null
        if (row[i] === 2048 && !won) {
          setWon(true)
        }
      }
    }
    return { row, addScore }
  }, [won])

  const checkGameOver = useCallback((currentGrid: (number | null)[][]) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentGrid[row][col] === null) return false
        if (col < GRID_SIZE - 1 && currentGrid[row][col] === currentGrid[row][col + 1]) return false
        if (row < GRID_SIZE - 1 && currentGrid[row][col] === currentGrid[row + 1][col]) return false
      }
    }
    return true
  }, [])

  const moveRight = useCallback(() => {
    let newGrid = grid.map(row => [...row])
    let newScore = score
    let moved = false

    for (let row = 0; row < GRID_SIZE; row++) {
      let r = slide(newGrid[row])
      const { row: combinedRow, addScore } = combine(r)
      r = slide(combinedRow)
      if (JSON.stringify(newGrid[row]) !== JSON.stringify(r)) {
        moved = true
      }
      newGrid[row] = r
      newScore += addScore
    }

    if (moved) {
      newGrid = addRandomTile(newGrid)
      setGrid(newGrid)
      setScore(newScore)
      if (newScore > bestScore) {
        setBestScore(newScore)
        localStorage.setItem('bestScore', newScore.toString())
      }
      if (checkGameOver(newGrid)) {
        setGameOver(true)
      }
    }
  }, [grid, score, bestScore, slide, combine, addRandomTile, checkGameOver])

  const moveLeft = useCallback(() => {
    let newGrid = grid.map(row => [...row].reverse())
    let newScore = score
    let moved = false

    for (let row = 0; row < GRID_SIZE; row++) {
      let r = slide(newGrid[row])
      const { row: combinedRow, addScore } = combine(r)
      r = slide(combinedRow)
      if (JSON.stringify(newGrid[row]) !== JSON.stringify(r)) {
        moved = true
      }
      newGrid[row] = r.reverse()
      newScore += addScore
    }

    if (moved) {
      newGrid = addRandomTile(newGrid)
      setGrid(newGrid)
      setScore(newScore)
      if (newScore > bestScore) {
        setBestScore(newScore)
        localStorage.setItem('bestScore', newScore.toString())
      }
      if (checkGameOver(newGrid)) {
        setGameOver(true)
      }
    }
  }, [grid, score, bestScore, slide, combine, addRandomTile, checkGameOver])

  const moveUp = useCallback(() => {
    let newGrid = createEmptyGrid()
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = grid[col][row]
      }
    }
    newGrid = newGrid.map(row => [...row].reverse())
    let newScore = score
    let moved = false

    for (let row = 0; row < GRID_SIZE; row++) {
      let r = slide(newGrid[row])
      const { row: combinedRow, addScore } = combine(r)
      r = slide(combinedRow)
      if (JSON.stringify(newGrid[row]) !== JSON.stringify(r)) {
        moved = true
      }
      newGrid[row] = r.reverse()
      newScore += addScore
    }

    const rotatedGrid = createEmptyGrid()
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        rotatedGrid[col][row] = newGrid[row][col]
      }
    }

    if (moved) {
      const finalGrid = addRandomTile(rotatedGrid)
      setGrid(finalGrid)
      setScore(newScore)
      if (newScore > bestScore) {
        setBestScore(newScore)
        localStorage.setItem('bestScore', newScore.toString())
      }
      if (checkGameOver(finalGrid)) {
        setGameOver(true)
      }
    }
  }, [grid, score, bestScore, slide, combine, addRandomTile, checkGameOver])

  const moveDown = useCallback(() => {
    let newGrid = createEmptyGrid()
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = grid[col][row]
      }
    }
    let newScore = score
    let moved = false

    for (let row = 0; row < GRID_SIZE; row++) {
      let r = slide(newGrid[row])
      const { row: combinedRow, addScore } = combine(r)
      r = slide(combinedRow)
      if (JSON.stringify(newGrid[row]) !== JSON.stringify(r)) {
        moved = true
      }
      newGrid[row] = r
      newScore += addScore
    }

    const rotatedGrid = createEmptyGrid()
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        rotatedGrid[col][row] = newGrid[row][col]
      }
    }

    if (moved) {
      const finalGrid = addRandomTile(rotatedGrid)
      setGrid(finalGrid)
      setScore(newScore)
      if (newScore > bestScore) {
        setBestScore(newScore)
        localStorage.setItem('bestScore', newScore.toString())
      }
      if (checkGameOver(finalGrid)) {
        setGameOver(true)
      }
    }
  }, [grid, score, bestScore, slide, combine, addRandomTile, checkGameOver])

  const resetGame = () => {
    const newGrid = createEmptyGrid()
    const gridWithTiles = addRandomTile(addRandomTile(newGrid))
    setGrid(gridWithTiles)
    setScore(0)
    setGameOver(false)
    setWon(false)
  }

  useEffect(() => {
    resetGame()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return
      switch (e.key) {
        case 'ArrowLeft':
          moveLeft()
          break
        case 'ArrowRight':
          moveRight()
          break
        case 'ArrowUp':
          moveUp()
          break
        case 'ArrowDown':
          moveDown()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, moveLeft, moveRight, moveUp, moveDown])

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">2048</h1>
        <div className="scores-container">
          <div className="score-box">
            <span className="score-label">SCORE</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="score-box">
            <span className="score-label">BEST</span>
            <span className="score-value">{bestScore}</span>
          </div>
        </div>
      </div>
      <div className="subtitle-container">
        <p className="subtitle">Join the numbers, get to 2048!</p>
        <button className="new-game-btn" onClick={resetGame}>
          New Game
        </button>
      </div>
      <div className="game-container">
        <div className="grid-background">
          {grid.map((row, rowIndex) => (
            <div className="grid-row" key={rowIndex}>
              {row.map((_, colIndex) => (
                <div className="grid-cell" key={`${rowIndex}-${colIndex}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="tiles-container">
          {grid.map((row, rowIndex) => (
            <div className="grid-row" key={rowIndex}>
              {row.map((value, colIndex) => {
                const tileStyle = getTileStyle(value)
                return (
                  <div className="grid-cell" key={`${rowIndex}-${colIndex}`}>
                    {value !== null && (
                      <div
                        className="tile"
                        style={{
                          backgroundColor: tileStyle.background
                        }}
                      >
                        <span
                          className="tile-text"
                          style={{
                            color: tileStyle.color,
                            fontSize: tileStyle.fontSize
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        {(gameOver || won) && (
          <div className="game-message">
            <div className="message-content">
              <h2 className="message-title">
                {won ? 'You Win!' : 'Game Over!'}
              </h2>
              <button className="play-again-btn" onClick={resetGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="instructions">
        <p className="instruction-text">
          <strong>How to play:</strong> Use arrow keys or swipe to move tiles. When two tiles with the same number touch, they merge into one!
        </p>
      </div>
    </div>
  )
}

export default App
