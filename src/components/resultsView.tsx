import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Match} from "../model/Match.ts";
import {fetchMatchesForLobby} from "../database/supabaseConnector.ts";

export default function ResultsView() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Match[]>([]);

    useEffect(() => {
        fetchMatchesForLobby(id).then(setMatches)
    }, [id]);

    return (
        <div className={"h-screen m-4"}>
            {(matches).map((match) => (
                <div key={match.id} className={"bg-gray-700 text-white p-3.5 m-2 rounded-lg"}>
                    <h3>{match.title}</h3>
                    <p>{match.description}</p>
                </div>
            ))}
            <button onClick={() => navigate("/")}>Finish Voting</button>
        </div>
    )
}