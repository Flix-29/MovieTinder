import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {supabase} from "../database/supabaseClient.ts";
import {Match} from "../model/Match.ts";

export default function ResultsView() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Array<Match>>([]);

    useEffect(() => {
        const fetchMatches = async () => {
            const {data, error} = await supabase
                .from("matches")
                .select()
                .eq("lobby_id", id)

            if (error) {
                console.error("Error fetching matches:", error);
            }

            if (data) {
                setMatches(data);
            }
        }

        fetchMatches()
        const subscription = supabase
            .channel("delete_lobbies")
            .on("postgres_changes", {
                event: "DELETE",
                schema: "public",
                table: "lobbies",
                filter: `id=eq.${id}`
            }, () => {
                navigate("/");
            })

        return () => {
            supabase.removeChannel(subscription);
        }
    }, [id, navigate]);

    async function finishVoting() {
        const users = await deleteVotes();
        deleteUser(users);
        deleteMatches();
        deleteLobby();

        navigate("/");
    }

    async function deleteVotes(): Promise<string[] | undefined> {
        const {data, error} = await supabase
            .from("votes")
            .delete()
            .eq("lobby_id", id)
            .select();

        if (error) {
            console.error("Error deleting votes:", error);
        }

        return data?.map(data => data.user_id);
    }

    async function deleteUser(userIds?: string[]) {
        if (!userIds) {
            return
        }

        const {error} = await supabase
            .from("users")
            .delete()
            .in("id", userIds);

        if (error) {
            console.error("Error deleting user:", error);
        }
    }

    async function deleteMatches() {
        const {error} = await supabase
            .from("matches")
            .delete()
            .eq("lobby_id", id);

        if (error) {
            console.error("Error deleting matches:", error);
        }
    }

    async function deleteLobby() {
        const {error} = await supabase
            .from("lobbies")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting lobby:", error);
        }
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