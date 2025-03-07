import {BrowserRouter, Route, Routes} from "react-router-dom";
import CreateLobbyView from "./components/createLobby.tsx";
import JoinLobbyView from "./components/joinLobbyView.tsx";
import LobbyView from "./components/lobbyView.tsx";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CreateLobbyView />} />
                <Route path="/join" element={<JoinLobbyView />} />
                <Route path="/lobby/:id" element={<LobbyView />} />
            </Routes>
        </BrowserRouter>
    );
}
