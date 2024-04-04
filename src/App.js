import React, { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
  const wordle = "HELLO";
  const numberOfRows = 6;
  const rowSize = 5;
  const sucessMessages = [
    "Genius! On your first try!",
    "Magnificent!",
    "Impressive",
    "Splendid",
    "Great",
    "Phew"
  ];
  const [activeRow, setActiveRow] = useState(0);
  const [error, setError] = useState("Make a guess!");
  const inputRefs = useRef([...Array(numberOfRows)].map(() => Array(rowSize).fill(0).map(() => React.createRef())));

  const getBackgroundColor = (value, index) => {
    const curr = wordle.charAt(index);
    if (value === curr) {
      return '#6ca965';
    } else if (wordle.includes(value)) {
      return '#c8b653';
    }
    return '#787c7f';
  };

  const isValidWord = async (word) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (response.status === 404) {
        console.error('404 Not Found error');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating word:', error);
      return false;
    }
  };

  const changeRow = (rowIndex) => {
    inputRefs.current[rowIndex].forEach((ref, colIndex) => {
      const value = ref.current.value.toUpperCase();
      const color = getBackgroundColor(value, colIndex);
      ref.current.style.backgroundColor = color;
      ref.current.style.color = "white";
    });
  };

  const handleInputChange = async (event, rowIndex, columnIndex) => {
    const nextIndex = columnIndex + 1;
    setError("Make a guess!");

    if (event.key === 'Backspace' && event.target.value === '') {
      const prevIndex = columnIndex - 1;
      if (prevIndex >= 0) {
        inputRefs.current[rowIndex][prevIndex].current.focus();
      }
    } else if (event.key === 'Enter') {
      const isRowComplete = inputRefs.current[rowIndex].every(ref => ref.current && ref.current.value !== '');
      if (isRowComplete) {
        const word = inputRefs.current[rowIndex].map(ref => ref.current.value.toUpperCase()).join('');
        if (word === wordle) {
          changeRow(rowIndex);
          setActiveRow(6);
          const message = sucessMessages[rowIndex];
          setError(message);
        } else {
          const valid = await isValidWord(word);
          if (valid) {
            changeRow(rowIndex);
            if (rowIndex < numberOfRows - 1) {
              setActiveRow(rowIndex + 1);
            }else{
              setActiveRow(rowSize);
              setError("Out of attempts :(");
            }
          } else {
            setError(word + " is not a valid word");
            setActiveRow(rowIndex);
          }
        }
      }
    } else if (event.target.value.length >= 1 && nextIndex < rowSize) {
      inputRefs.current[rowIndex][nextIndex].current.focus();
    }
  };

  useEffect(() => {
    if (activeRow < numberOfRows && inputRefs.current[activeRow][0].current) {
      inputRefs.current[activeRow][0].current.focus();
    }
  }, [activeRow, numberOfRows]);

  return (
    <div className='screen'>
      <header><h1>Wordle</h1></header>
      <div className='wordle'>
        {inputRefs.current.map((row, rowIndex) => (
          <div key={rowIndex} className='word'>
            {row.map((ref, columnIndex) => (
              <input
                key={columnIndex}
                type="text"
                maxLength="1"
                ref={ref}
                onKeyDown={(event) => handleInputChange(event, rowIndex, columnIndex)}
                disabled={rowIndex !== activeRow}
                style={{ textTransform: 'uppercase' }}
                className='single-char-input'
              />
            ))}
          </div>
        ))}
      </div>
      <h2>{error}</h2>
    </div>
  );
}

export default App;
