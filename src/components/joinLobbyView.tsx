import {joinLobbyByCode} from "../database/lobbyConnector.ts";
import {useState} from "react";

export default function JoinLobbyView() {
    const [code, setCode] = useState("");
    const [lobbyData, setLobbyData] = useState(null);

    const handleJoinLobby = async () => {
        const lobby = await joinLobbyByCode(code);
        if (lobby) {
            setLobbyData(lobby);
        } else {
            alert("Lobby not found");
        }
    };

    return (
        <div>
            <h2>Join a Lobby</h2>
            <input
                type="text"
                placeholder="Enter lobby code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />
            <button onClick={handleJoinLobby}>Join</button>

            {lobbyData && <div>Lobby Name: {lobbyData.name}</div>}
        </div>
    );
};