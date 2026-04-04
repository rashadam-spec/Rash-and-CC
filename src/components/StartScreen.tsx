interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export default function StartScreen({ highScore, onStart }: StartScreenProps) {
  return (
    <div className="overlay start-screen">
      <div className="start-screen__deco start-screen__deco--tl">🥚</div>
      <div className="start-screen__deco start-screen__deco--tr">🌸</div>
      <div className="start-screen__deco start-screen__deco--bl">🌷</div>
      <div className="start-screen__deco start-screen__deco--br">🐣</div>
      <h1 className="start-screen__title">Bunny Jump!</h1>
      <p className="start-screen__subtitle">Help the bunny collect Easter eggs!</p>
      {highScore > 0 && (
        <p className="start-screen__highscore">Best: {Math.floor(highScore)}</p>
      )}
      <button className="btn btn--start" onClick={onStart}>
        🐰 Tap to Play!
      </button>
      <p className="start-screen__hint">Tap, click or press <strong>SPACE</strong> to jump · Double jump!</p>
    </div>
  );
}
