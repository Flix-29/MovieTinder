import { useParams } from "react-router-dom";

export default function LobbyView() {
    const { id } = useParams();

    return (
        <div>
            <h2>Lobby {id}</h2>
            <p>Waiting for other players...</p>
        </div>
    );
}