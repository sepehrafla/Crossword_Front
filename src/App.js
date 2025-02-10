import React, { useState, useEffect } from 'react';
import './App.css';
import crosswordData from './crosswordData.json';

function App() {
  // Example 5x5 crossword grid
  const [grid, setGrid] = useState([
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
  ]);

  // Add state for tracking active position and direction
  const [activeCell, setActiveCell] = useState(null);
  const [activeDirection, setActiveDirection] = useState('across'); // 'across' or 'down'

  // Replace the hardcoded data with data from the file
  const blackCells = new Set(crosswordData.blackCells);
  const acrossClues = crosswordData.clues.across;
  const downClues = crosswordData.clues.down;

  // Add state for incorrect cells
  const [incorrectCells, setIncorrectCells] = useState(new Set());

  // Add this state for correct cells
  const [correctCells, setCorrectCells] = useState(new Set());

  // Add this near the top of the component
  const [cellRefs] = useState(() => {
    const refs = {};
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        refs[`${row}-${col}`] = React.createRef();
      }
    }
    return refs;
  });

  // Add these new state variables at the top of the component
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // Add this near other state declarations
  const [activeClue, setActiveClue] = useState(null);

  // Update setActiveCell to focus the input
  const setActiveCellAndFocus = (cell) => {
    if (cell) {
      setActiveCell(cell);
      // Use setTimeout to ensure the focus happens after state update
      setTimeout(() => {
        const ref = cellRefs[`${cell.row}-${cell.col}`];
        if (ref.current) {
          ref.current.focus();
        }
      }, 0);
    }
  };

  // Update handleCellClick to use the new function
  const handleCellClick = (row, col) => {
    if (blackCells.has(`${row}-${col}`)) return;

    if (activeCell?.row === row && activeCell?.col === col) {
      setActiveDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setActiveCellAndFocus({ row, col });
    }
  };

  const isCellHighlighted = (row, col) => {
    if (!activeCell) return false;
    if (blackCells.has(`${row}-${col}`)) return false;

    if (activeDirection === 'across') {
      return row === activeCell.row;
    } else {
      return col === activeCell.col;
    }
  };

  // Add this function to format the time
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add this function to start the timer
  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      const interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  // Add this function to pause the timer
  const pauseTimer = () => {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      setIsTimerRunning(false);
    }
  };

  // Update handleCellChange to start timer on first input
  const handleCellChange = (row, col, value) => {
    // Start timer on first input
    if (!isTimerRunning && value) {
      startTimer();
    }

    const newGrid = grid.map((r, rowIndex) => 
      rowIndex === row 
        ? r.map((cell, colIndex) => 
            colIndex === col ? value.toUpperCase() : cell
          )
        : r
    );
    setGrid(newGrid);

    // Auto-advance to next cell
    if (value) {
      const nextCell = getNextCell(row, col);
      if (nextCell) {
        setActiveCellAndFocus(nextCell);
      }
    }
  };

  // Update handleKeyDown to use the new function
  const handleKeyDown = (e, row, col) => {
    if (e.key === 'Backspace' && !grid[row][col]) {
      e.preventDefault();
      const prevCell = getPreviousCell(row, col);
      if (prevCell) {
        setActiveCellAndFocus(prevCell);
        handleCellChange(prevCell.row, prevCell.col, '');
      }
    } else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      let nextCell;
      
      switch (e.key) {
        case 'ArrowRight':
          nextCell = getNextCellInDirection(row, col, 'right');
          setActiveDirection('across');
          break;
        case 'ArrowLeft':
          nextCell = getNextCellInDirection(row, col, 'left');
          setActiveDirection('across');
          break;
        case 'ArrowDown':
          nextCell = getNextCellInDirection(row, col, 'down');
          setActiveDirection('down');
          break;
        case 'ArrowUp':
          nextCell = getNextCellInDirection(row, col, 'up');
          setActiveDirection('down');
          break;
        default:
          break;
      }
      
      if (nextCell) {
        setActiveCellAndFocus(nextCell);
      }
    }
  };

  const getNextCellInDirection = (row, col, direction) => {
    switch (direction) {
      case 'right':
        for (let c = col + 1; c < 5; c++) {
          if (!blackCells.has(`${row}-${c}`)) {
            return { row, col: c };
          }
        }
        break;
      case 'left':
        for (let c = col - 1; c >= 0; c--) {
          if (!blackCells.has(`${row}-${c}`)) {
            return { row, col: c };
          }
        }
        break;
      case 'down':
        for (let r = row + 1; r < 5; r++) {
          if (!blackCells.has(`${r}-${col}`)) {
            return { row: r, col };
          }
        }
        break;
      case 'up':
        for (let r = row - 1; r >= 0; r--) {
          if (!blackCells.has(`${r}-${col}`)) {
            return { row: r, col };
          }
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const getPreviousCell = (row, col) => {
    if (activeDirection === 'across') {
      return getNextCellInDirection(row, col, 'left');
    } else {
      return getNextCellInDirection(row, col, 'up');
    }
  };

  const getNextCell = (row, col) => {
    if (activeDirection === 'across') {
      return getNextCellInDirection(row, col, 'right');
    } else {
      return getNextCellInDirection(row, col, 'down');
    }
  };

  // Get cell number (if it should have one)
  const getCellNumber = (row, col) => {
    const numbers = {
      '0-0': 1, '0-1': 2, '0-2': 3, '0-3': 4, '0-4': 5,
      '1-0': 6,
      '2-0': 7,
      '3-0': 8,
      '4-0': 9
    };
    return numbers[`${row}-${col}`];
  };

  // First, modify getActiveClueNumbers to not set state
  const getActiveClueNumbers = () => {
    if (!activeCell) return { across: null, down: null };
    
    let acrossNum = null;
    let downNum = null;
    let col = activeCell.col;
    while (col >= 0 && !blackCells.has(`${activeCell.row}-${col}`)) {
      const num = getCellNumber(activeCell.row, col);
      if (num) acrossNum = num;
      col--;
    }

    let row = activeCell.row;
    while (row >= 0 && !blackCells.has(`${row}-${activeCell.col}`)) {
      const num = getCellNumber(row, activeCell.col);
      if (num) downNum = num;
      row--;
    }

    return { across: acrossNum, down: downNum };
  };

  // Add this useEffect to handle active clue updates
  useEffect(() => {
    if (!activeCell) return;
    
    const { across, down } = getActiveClueNumbers();
    const currentClue = activeDirection === 'across' 
      ? acrossClues.find(clue => clue.number === across)
      : downClues.find(clue => clue.number === down);
    
    setActiveClue(currentClue);
  }, [activeCell, activeDirection]); // Dependencies

  // Update the handleCheck function
  const handleCheck = () => {
    const newIncorrectCells = new Set();
    const newCorrectCells = new Set();
    
    // Check each cell against the solution
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (!blackCells.has(`${row}-${col}`)) {
          const currentValue = grid[row][col];
          const correctValue = crosswordData.grid[row][col];
          
          if (currentValue) {
            if (currentValue === correctValue) {
              newCorrectCells.add(`${row}-${col}`);
            } else {
              newIncorrectCells.add(`${row}-${col}`);
            }
          }
        }
      }
    }
    
    setIncorrectCells(newIncorrectCells);
    setCorrectCells(newCorrectCells);
  };

  // Add this helper function
  const isCorrect = (row, col) => correctCells.has(`${row}-${col}`);

  // Update the input element render to show incorrect cells
  const isIncorrect = (row, col) => incorrectCells.has(`${row}-${col}`);

  // Update handleClear to also clear correct cells
  const handleClear = () => {
    setGrid([
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']
    ]);
    setIncorrectCells(new Set());
    setCorrectCells(new Set());
    clearInterval(timerInterval);
    setTime(0);
    setIsTimerRunning(false);
    setTimerInterval(null);
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  return (
    <div className="App">
      <div className="header">
        <h1>The Mini Crossword</h1>
        <p className="subheader">Monday, February 10, 2025</p>
        <p className="byline">By Tracy Bennett • Edited by Joel Fagliano</p>
      </div>

      <div className="toolbar">
        <div className="timer" onClick={() => isTimerRunning ? pauseTimer() : startTimer()}>
          {formatTime(time)}
        </div>
        <button onClick={handleCheck}>Check</button>
        <button onClick={handleClear}>Clear</button>
      </div>

      <div className="game-container">
        <div className="puzzle-area">
          {activeClue && (
            <div className="active-clue-display">
              <span className="clue-number">{activeClue.number}.</span> {activeClue.clue}
            </div>
          )}
          
          <div className="crossword-grid">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((cell, colIndex) => {
                  const isBlackCell = blackCells.has(`${rowIndex}-${colIndex}`);
                  const cellNumber = getCellNumber(rowIndex, colIndex);
                  const isHighlighted = isCellHighlighted(rowIndex, colIndex);
                  const isActive = activeCell?.row === rowIndex && activeCell?.col === colIndex;

                  return (
                    <div 
                      key={`${rowIndex}-${colIndex}`} 
                      className="cell-container"
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cellNumber && <div className="cell-number">{cellNumber}</div>}
                      {isBlackCell ? (
                        <div className="grid-cell black-cell" />
                      ) : (
                        <input
                          ref={cellRefs[`${rowIndex}-${colIndex}`]}
                          className={`grid-cell 
                            ${isHighlighted ? 'highlighted' : ''} 
                            ${isActive ? 'active' : ''} 
                            ${isIncorrect(rowIndex, colIndex) ? 'incorrect' : ''}
                            ${isCorrect(rowIndex, colIndex) ? 'correct' : ''}`}
                          type="text"
                          maxLength="1"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="clues-container">
          <div className="clues-section">
            <h3>ACROSS</h3>
            {acrossClues.map(({number, clue}) => {
              const { across } = getActiveClueNumbers();
              const isActive = number === across && activeDirection === 'across';
              return (
                <div 
                  key={`across-${number}`} 
                  className={`clue ${isActive ? 'active-clue' : ''}`}
                >
                  <span className="clue-number">{number}</span> {clue}
                </div>
              );
            })}
          </div>
          <div className="clues-section">
            <h3>DOWN</h3>
            {downClues.map(({number, clue}) => {
              const { down } = getActiveClueNumbers();
              const isActive = number === down && activeDirection === 'down';
              return (
                <div 
                  key={`down-${number}`} 
                  className={`clue ${isActive ? 'active-clue' : ''}`}
                >
                  <span className="clue-number">{number}</span> {clue}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
