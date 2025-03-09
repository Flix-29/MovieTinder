import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {supabase} from "../database/supabaseClient";
import Lobby from "../model/Lobby.ts";
import {Movie} from "../model/Movie.ts";
import {getMoviesFromPage} from "../logic/MovieDBRequest.ts";

export default function LobbyView() {
    const {id} = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [lobby, setLobby] = useState<Lobby>();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLobby = async () => {
            const {data, error} = await supabase
                .from("lobbies")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching lobby:", error);
            } else {
                setLobby(data);
            }

            setLoading(false);
        };

        fetchLobby();
        fetchMovies();

        const subscription = supabase
            .channel("lobby_updates")
            .on("postgres_changes", {
                event: "UPDATE",
                schema: "public",
                table: "lobbies",
                filter: `id=eq.${id}`
            }, (payload) => {
                const lobby = {
                    id: payload.new.id,
                    created_at: payload.new.created_at,
                    name: payload.new.name,
                    code: payload.new.code,
                    started: payload.new.started
                }
                setLobby(lobby);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [id, page]);

    useEffect(() => {
        const likeSubscription = supabase
            .channel("vote_updates")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "votes",
                filter: `lobby_id=eq.${lobby?.id}`
            }, async (payload) => {
                const {data} = await supabase
                    .from("votes")
                    .select()
                    .eq("lobby_id", lobby?.id)
                    .eq("movie_id", payload.new.movie_id)
                    .eq("vote", true);

                if (data && data.length >= 2) {
                    const movie = movies.find(movie => movie.id === parseInt(payload.new.movie_id));
                    alert(`Match found! "${movie?.title}" was liked by all participants!`);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(likeSubscription);
        }
    }, [movies, lobby?.id]);

    const fetchMovies = async () => {
        const filter = {
            include_adult: false,
            include_video: false,
            language: 'de-DE',
            pageNumber: page,
            watch_region: 'DE'
        }
        const movies = await getMoviesFromPage(filter)

        setMovies(movies);
    }

    const handleVote = async (liked: boolean) => {
        if (!lobby) return;
        const {error} = await supabase
            .from("votes")
            .upsert([
                {
                    lobby_id: lobby.id,
                    user_id: 'ff90c61b-1fb9-4bbe-98d1-89b1dc0bfca8',
                    movie_id: movies[currentIndex].id,
                    vote: liked
                }
            ]);

        if (error) {
            console.error("Error voting:", error);
            return;
        }

        setCurrentIndex(getNextIndex());
    }

    function getNextIndex(): number {
        if (currentIndex + 1 >= movies.length) {
            setPage(page + 1);
            fetchMovies()
            return 0;
        }
        return currentIndex + 1;
    }

    if (loading) return <p>Loading lobby...</p>;
    if (!lobby) return <p>Lobby not found</p>;
    if (!lobby.started) return <p>Waiting for host to start...</p>;

    return (
        <div>
            {!lobby.started ? <p>Voting has started!</p> :
                <div>
                    <h1>{movies[currentIndex].title}</h1>
                    <img src={"https://image.tmdb.org/t/p/w500/" + movies[currentIndex].poster_path}/>
                    <button onClick={() => handleVote(true)}>Like 👍</button>
                    <button onClick={() => handleVote(false)}>Dislike 👎</button>
                </div>
            }
        </div>
    );
}