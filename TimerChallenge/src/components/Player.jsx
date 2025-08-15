import { useState, useRef } from "react";

export default function Player() {
  const playerName = useRef(null);
  const [enteredPlayerName, setEnteredPlayerName] = useState("");

  const handleSubmit = () => {
    setEnteredPlayerName(playerName.current.value);
    playerName.current.value = "";
  };

  return (
    <section id="player">
      <h2>Welcome {enteredPlayerName || "unknown entity"}</h2>
      <p>
        <input ref={playerName} type="text" />
        <button onClick={handleSubmit}>Set Name</button>
      </p>
    </section>
  );
}
