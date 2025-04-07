import {useState} from "react";
import {createFilter, createLobby, startLobbyWithId} from "../database/supabaseConnector.ts";
import {QRCodeCanvas} from "qrcode.react";
import Lobby from "../model/Lobby.ts";
import {useLocation, useNavigate} from 'react-router-dom'
import Toast from "./toast.tsx";
import {Filter} from "../model/Filter.ts";
import SpinnerEffect from "./SpinnerEffect.tsx";

export default function JoinLobbyView() {
    const [lobby, setLobby] = useState<Lobby>();
    const navigate = useNavigate();

    const location = useLocation();
    const {language, region, selectedProvider} = location.state || {};

    const buildLobby = async () => {
        const lobby = await createLobby();
        if (lobby) {
            setLobby(lobby);
        } else {
            alert("Error creating lobby");
        }

        const filter: Filter = {
            language: language,
            pageNumber: 1,
            watch_region: region,
            provider: selectedProvider
        }

        if (lobby && lobby.id && filter) {
            await createFilter(lobby.id, filter);
        }
    }

    if (!lobby) {
        buildLobby();
    }

    async function startLobby(lobbyId: string) {
        await startLobbyWithId(lobbyId);
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/lobby/${lobbyId}`);
    }

    if (lobby === undefined) {
        return (
            <div className="flex mt-40 items-center justify-center p-5">
                <SpinnerEffect/>
                <p>Waiting for Lobby to be created...</p>
            </div>
        );
    } else {
        const currentUrl = window.location.href;
        const linkToLobby = `${currentUrl.substring(0, currentUrl.lastIndexOf("/#/"))}/#/lobby/${lobby.id}`;
        const codeFigures = lobby.code.toString().split("");
        return (
            <div className="h-screen mt-32">
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
                    onClick={() => {
                        startLobby(lobby.id)
                    }}
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
