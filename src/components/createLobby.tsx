import {useState} from "react";
import {createLobby} from "../database/lobbyConnector.ts";
import {QRCodeCanvas} from "qrcode.react";
import Lobby from "../model/Lobby.ts";
import {useNavigate} from 'react-router-dom'
import {supabase} from "../database/supabaseClient.ts";

export default function CreateLobbyView() {
    const [lobby, setLobby] = useState<Lobby>();
    const navigate = useNavigate();

    const buildLobby = async () => {
        const lobby = await createLobby();
        if (lobby) {
            setLobby(lobby);
        } else {
            alert("Error creating lobby");
        }
    };

    if (!lobby) {
        buildLobby();
    }

    async function startLobby(lobbyId: string) {
        const {error} = await supabase
            .from("lobbies")
            .update({started: true})
            .eq("id", lobbyId)

        if (error) {
            throw error;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/lobby/${lobbyId}`);
    }

    if (lobby === undefined) {
        return (
            <p>Waiting for Lobby to be created...</p>
        );
    } else {
        const linkToLobby = `${window.location.href.substring(0, window.location.href.lastIndexOf("/#/"))}/#/lobby/${lobby.id}`;
        return (
            <div>
                <h2>Lobby created!</h2>
                <p>Join by entering the code or scanning the qr-code below.</p>
                <p>Code: {lobby.code}</p>
                <p>{linkToLobby}</p>
                <QRCodeCanvas value={linkToLobby}/>
                <button onClick={() => {
                    startLobby(lobby.id)
                }}>
                    Start Swiping
                </button>
            </div>
        )
    }
}
