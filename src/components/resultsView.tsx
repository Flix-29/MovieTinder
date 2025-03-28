import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {Match} from "../model/Match.ts";
import {deleteFromTableWithColumnIds, fetchMatchesForLobby} from "../database/supabaseConnector.ts";

export default function ResultsView() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Match[]>([]);

    useEffect(() => {
        fetchMatchesForLobby(id).then(setMatches)
    }, [id]);

    async function finishVoting() {
        // TODO: build general cleanup logic
        if (id) {
            await deleteFromTableWithColumnIds('votes', 'lobby_id', Array.of(id));
            await deleteFromTableWithColumnIds('matches', 'lobby_id', Array.of(id));
            await deleteFromTableWithColumnIds('lobbies', 'id', Array.of(id));
            await deleteFromTableWithColumnIds('filter', 'lobby_id', Array.of(id));
        }

        navigate("/");
    }

    return (
        <div className={"m-4"}>
            {(matches).map((match) => (
                <div key={match.id} className={"bg-gray-700 text-white p-3.5 m-2 rounded-lg"}>
                    <h3>{match.title}</h3>
                    <p>{match.description}</p>
                </div>
            ))}
            <button onClick={finishVoting}>Finish Voting</button>
        </div>
    )
}