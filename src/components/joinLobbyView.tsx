import {useState} from "react";
import {createLobby} from "../database/lobbyConnector.ts";
import {QRCodeCanvas} from "qrcode.react";
import Lobby from "../model/Lobby.ts";
import {useNavigate} from 'react-router-dom'
import {supabase} from "../database/supabaseClient.ts";
import Toast from "./toast.tsx";

export default function JoinLobbyView() {
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
        const currentUrl = window.location.href;
        const linkToLobby = `${currentUrl.substring(0, currentUrl.lastIndexOf("/#/"))}/#/lobby/${lobby.id}`;
        const codeFigures = lobby.code.toString().split("");
        return (
            <div className="mt-32">
                <h1 className="mb-12 text-5xl font-extrabold leading-none tracking-tight lg:text-6xl">Lobby
                    created!</h1>
                <p className="mb-5">Join the Lobby by entering the code or scanning the QR-code below.</p>
                <div className="bg-rebecca ps-0 pe-0 p-4.5 m-auto max-w-fit">
                    {codeFigures.map((figure, index) => (
                        <span key={index} className="text-white text-3xl p-4 border-2 border-gray-400">{figure}</span>
                    ))}
                </div>
                <div className="m-5">
                    <QRCodeCanvas
                        value={linkToLobby}
                        className="m-auto max-w-fit"
                    />
                </div>
                <button
                    className="bg-maximum-green hover:bg-bud-green text-white font-bold py-2 px-4 rounded"
                    onClick={() => {startLobby(lobby.id)}}
                >
                    Start Swiping
                </button>
                {
                    !lobby ? <Toast message="Error creating lobby."/> : null
                }
            </div>
        )
    }
}
