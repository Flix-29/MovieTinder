import { HashRouter as Router, Route, Routes } from "react-router-dom";
import CreateLobbyView from "./components/createLobby.tsx";
import JoinLobbyView from "./components/joinLobbyView.tsx";
import LobbyView from "./components/lobbyView.tsx";
import ResultsView from "./components/resultsView.tsx";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CreateLobbyView />} />
                <Route path="/join" element={<JoinLobbyView />} />
                <Route path="/lobby/:id" element={<LobbyView />} />
                <Route path="/result/:id" element={<ResultsView />} />
            </Routes>
        </Router>
    );
}
