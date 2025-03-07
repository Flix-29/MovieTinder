import {useState} from "react";
import {createLobby} from "../database/lobbyConnector.ts";
import {QRCodeCanvas} from "qrcode.react";

export default function CreateLobbyView() {
    const [lobby, setLobby] = useState(undefined);

    const createLobbyButton = async () => {
        const lobby = await createLobby();
        if (lobby) {
            setLobby(lobby);
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
            </div>
        );
    } else {
        const linkToLobby = `https://link-to-url.de/${lobby.id}`;
        return (
            <div>
                <h2>Lobby created!</h2>
                <p>Join by entering the code or scanning the qr-code below.</p>
                <p>Code: {lobby.code}</p>
                <p>{linkToLobby}</p>
                <QRCodeCanvas value={linkToLobby} />
                <button onClick={() => {}}>Start Swiping</button>
            </div>
        )
    }
}
