import {joinLobbyByCode} from "../database/lobbyConnector.ts";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function JoinLobbyView() {
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    const handleJoinLobby = async () => {
        const lobby = await joinLobbyByCode(code);
        if (lobby) {
            navigate(`/lobby/${lobby.id}`);
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
        </div>
    );
};