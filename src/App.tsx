import { HashRouter as Router, Route, Routes } from "react-router-dom";
import JoinLobbyView from "./components/joinLobbyView.tsx";
import LobbyView from "./components/lobbyView.tsx";
import ResultsView from "./components/resultsView.tsx";
import HomeView from "./components/homeView.tsx";
import CreateLobbyView from "./components/createLobbyView.tsx";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomeView />} />
                <Route path="/join" element={<JoinLobbyView />} />
                <Route path="/create" element={<CreateLobbyView />} />
                <Route path="/lobby/:id" element={<LobbyView />} />
                <Route path="/result/:id" element={<ResultsView />} />
            </Routes>
        </Router>
    );
}
