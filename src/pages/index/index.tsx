import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'
import { Game2048 } from '../../utils/game'

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

export default function Index() {
  const [game, setGame] = useState<Game2048>(new Game2048(0))
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  useEffect(() => {
    const bestScore = Taro.getStorageSync('bestScore') || 0
    setGame(new Game2048(bestScore))
  }, [])

  useEffect(() => {
    Taro.setStorageSync('bestScore', game.bestScore)
  }, [game.bestScore])

  const handleReset = () => {
    const newGame = new Game2048(game.bestScore)
    setGame(newGame)
  }

  const handleMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (game.gameOver) return
    const newGame = new Game2048(game.bestScore)
    newGame.grid = JSON.parse(JSON.stringify(game.grid))
    newGame.score = game.score
    newGame.won = game.won

    switch (direction) {
      case 'left':
        newGame.moveLeft()
        break
      case 'right':
        newGame.moveRight()
        break
      case 'up':
        newGame.moveUp()
        break
      case 'down':
        newGame.moveDown()
        break
    }
    setGame(newGame)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const diffX = touchEndX - touchStartX.current
    const diffY = touchEndY - touchStartY.current

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 20) {
        handleMove(diffX > 0 ? 'right' : 'left')
      }
    } else {
      if (Math.abs(diffY) > 20) {
        handleMove(diffY > 0 ? 'down' : 'up')
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          handleMove('left')
          break
        case 'ArrowRight':
          handleMove('right')
          break
        case 'ArrowUp':
          handleMove('up')
          break
        case 'ArrowDown':
          handleMove('down')
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game])

  return (
    <View className='container' onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <View className='header'>
        <Text className='title'>2048</Text>
        <View className='scores-container'>
          <View className='score-box'>
            <Text className='score-label'>SCORE</Text>
            <Text className='score-value'>{game.score}</Text>
          </View>
          <View className='score-box'>
            <Text className='score-label'>BEST</Text>
            <Text className='score-value'>{game.bestScore}</Text>
          </View>
        </View>
      </View>
      <View className='subtitle-container'>
        <Text className='subtitle'>Join the numbers, get to 2048!</Text>
        <TouchableOpacity className='new-game-btn' onClick={handleReset}>
          <Text className='new-game-text'>New Game</Text>
        </TouchableOpacity>
      </View>
      <View className='game-container'>
        <View className='grid-background'>
          {[0, 1, 2, 3].map((row) => (
            <View className='grid-row' key={row}>
              {[0, 1, 2, 3].map((col) => (
                <View className='grid-cell' key={`${row}-${col}`} />
              ))}
            </View>
          ))}
        </View>
        <View className='tiles-container'>
          {game.grid.map((row, rowIndex) => (
            <View className='grid-row' key={rowIndex}>
              {row.map((value, colIndex) => {
                const tileStyle = getTileStyle(value)
                return (
                  <View className='grid-cell' key={`${rowIndex}-${colIndex}`}>
                    {value !== null && (
                      <View className='tile' style={{ backgroundColor: tileStyle.background }}>
                        <Text className='tile-text' style={{ color: tileStyle.color, fontSize: tileStyle.fontSize }}>
                          {value}
                        </Text>
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          ))}
        </View>
        {(game.gameOver || game.won) && (
          <View className='game-message'>
            <View className='message-content'>
              <Text className='message-title'>
                {game.won ? 'You Win!' : 'Game Over!'}
              </Text>
              <TouchableOpacity className='play-again-btn' onClick={handleReset}>
                <Text className='play-again-text'>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <View className='instructions'>
        <Text className='instruction-text'>
          <Text className='strong'>How to play:</Text> Use arrow keys or swipe to move tiles. When two tiles with the same number touch, they merge into one!
        </Text>
      </View>
    </View>
  )
}
