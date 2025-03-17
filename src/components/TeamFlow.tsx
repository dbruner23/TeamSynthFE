import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CatDoorGame.css";

interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

const CatDoorGame: React.FC = () => {
  const [doors, setDoors] = useState<number[]>([1, 2, 3]);
  const [correctDoor, setCorrectDoor] = useState<number>(0);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [catImage, setCatImage] = useState<CatImage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  // Initialize the game
  useEffect(() => {
    resetGame();
  }, []);

  // Fetch a cat image from the API
  const fetchCatImage = async () => {
    try {
      setLoading(true);
      const response = await axios.get<CatImage[]>("https://api.thecatapi.com/v1/images/search");
      setCatImage(response.data[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cat image:", error);
      setLoading(false);
    }
  };

  // Reset the game with a new random door
  const resetGame = () => {
    setSelectedDoor(null);
    setGameWon(false);
    setCatImage(null);
    // Generate random number between 1 and 3
    const newCorrectDoor = Math.floor(Math.random() * 3) + 1;
    setCorrectDoor(newCorrectDoor);
  };

  // Handle door selection
  const handleDoorClick = (doorNumber: number) => {
    if (selectedDoor !== null || gameWon) return;
    
    setSelectedDoor(doorNumber);
    
    if (doorNumber === correctDoor) {
      setGameWon(true);
      fetchCatImage();
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    resetGame();
  };

  return (
    <div className="cat-door-game">
      <h1>Cat Door Game</h1>
      <p>Find the cat behind one of these doors!</p>
      
      <div className="doors-container">
        {doors.map((doorNumber) => (
          <div
            key={doorNumber}
            className={`door ${selectedDoor === doorNumber ? 'open' : ''} 
                        ${selectedDoor === doorNumber && doorNumber === correctDoor ? 'correct' : ''}
                        ${selectedDoor === doorNumber && doorNumber !== correctDoor ? 'incorrect' : ''}`}
            onClick={() => handleDoorClick(doorNumber)}
          >
            <div className="door-face">
              {selectedDoor === doorNumber && doorNumber === correctDoor && catImage ? (
                loading ? (
                  <div className="loading">Loading...</div>
                ) : (
                  <div className="cat-container">
                    <img src={catImage.url} alt="Cat" className="cat-image" />
                  </div>
                )
              ) : selectedDoor === doorNumber && doorNumber !== correctDoor ? (
                <div className="empty-door">Nothing here!</div>
              ) : (
                <div className="door-number">{doorNumber}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {gameWon && (
        <div className="game-result">
          <h2>Congratulations! You found the cat!</h2>
          <button className="play-again-btn" onClick={handlePlayAgain}>
            Play Again
          </button>
        </div>
      )}
      
      {selectedDoor !== null && !gameWon && (
        <div className="game-result">
          <h2>Sorry, no cat behind this door!</h2>
          <button className="play-again-btn" onClick={handlePlayAgain}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default CatDoorGame;
