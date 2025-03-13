import {useState} from "react";
import {joinLobbyByCode} from "../database/lobbyConnector.ts";
import {useNavigate} from "react-router-dom";

export default function HomeView() {
    const navigate = useNavigate();
    const [code, setCode] = useState("");

    const handleJoinLobby = async () => {
        const lobby = await joinLobbyByCode(code);
        if (lobby) {
            navigate(`/lobby/${lobby.id}`);
        } else {
            alert("Lobby not found");
        }
    };

    return (
        <div className="mt-40">
            <div className="mb-16">
                <h1 className="mb-12 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl">Movie Tinder</h1>
                <p className="text-xl m-auto mb-3 max-w-3/5">Swipe on movies to find some you all like.</p>
                <p className="text-xl m-auto mb-3 max-w-3/5">Create a lobby or join one to get started.</p>
            </div>
            <div className="mb-8">
                <input
                    type="number"
                    placeholder="Enter lobby code"
                    value={code}
                    className="p-2 mr-2 bg-pistachio text-black rounded"
                    onChange={(e) => setCode(e.target.value)}
                />
                <button
                    className="bg-maximum-green hover:bg-bud-green text-white font-bold py-2 px-4 rounded"
                    onClick={handleJoinLobby}
                >
                    Join
                </button>
            </div>
            <div>
                <button
                    className="bg-rebecca hover:bg-royal-purple text-white font-bold py-2 px-4 rounded"
                    onClick={() => navigate("/create")}
                >
                    Create Lobby
                </button>
            </div>
        </div>
    )
}