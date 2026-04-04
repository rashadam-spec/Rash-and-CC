interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

function getStars(score: number): number {
  if (score >= 2000) return 3;
  if (score >= 800) return 2;
  if (score >= 200) return 1;
  return 0;
}

export default function GameOverScreen({ score, highScore, onRestart }: GameOverScreenProps) {
  const stars = getStars(score);
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="overlay gameover-screen">
      <h2 className="gameover-screen__title">Game Over!</h2>
      {isNewHighScore && <p className="gameover-screen__new-hs">🎉 New High Score!</p>}
      <div className="gameover-screen__stars">
        {[1, 2, 3].map(i => (
          <span key={i} className={`star ${i <= stars ? 'star--filled' : 'star--empty'}`}>★</span>
        ))}
      </div>
      <p className="gameover-screen__score">Score: <strong>{Math.floor(score)}</strong></p>
      {highScore > 0 && (
        <p className="gameover-screen__highscore">Best: {Math.floor(highScore)}</p>
      )}
      <button className="btn btn--restart" onClick={onRestart}>
        🐰 Play Again!
      </button>
    </div>
  );
}
