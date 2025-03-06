import {useState} from "react";
import {createLobby} from "../database/lobbyConnector.ts";
import {QRCode} from "react-qrcode";

export default function CreateLobbyView() {
    let created = false;
    const [lobby, setLobby] = useState(undefined);

    const createLobbyButton = async () => {
        const lobby = await createLobby();
        if (lobby) {
            setLobby(lobby);
            created = true;
        } else {
            alert("Error creating lobby");
        }
    }

    if (lobby === undefined) {
        return (
            <div>
                <button
                    onClick={() => {
                        createLobbyButton()
                    }}
                >
                    Create Lobby
                </button>
                <p>{created}</p>
            </div>
        );
    } else {
        const linkToLobby = `https://link-to-url.de/${lobby.id}`;
        return (
            <div>
                <h2>Lobby created!</h2>
                <p>Code: {lobby.code}</p>
                <p>{linkToLobby}</p>
                <p>{created}</p>
                <QRCode value={linkToLobby} />
            </div>
        )
    }
}
