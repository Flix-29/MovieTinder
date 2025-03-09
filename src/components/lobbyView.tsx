import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Dialog, DialogPanel, DialogBackdrop, DialogTitle} from "@headlessui/react";
import {supabase} from "../database/supabaseClient";
import Lobby from "../model/Lobby.ts";
import {Movie} from "../model/Movie.ts";
import {getMoviesFromPage} from "../logic/MovieDBRequest.ts";

export default function LobbyView() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [lobby, setLobby] = useState<Lobby>();
    const [loading, setLoading] = useState(true);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [matchedMovie, setMatchedMovie] = useState<Movie>();

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
                    await supabase
                        .from("matches")
                        .insert({
                            lobby_id: lobby?.id,
                            movie_id: movie?.id,
                            title: movie?.title,
                            description: movie?.overview
                        })
                    setMatchedMovie(movie)
                    setDialogOpen(true)
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
            <div>
                <h1>{movies[currentIndex].title}</h1>
                <img src={"https://image.tmdb.org/t/p/w500/" + movies[currentIndex].poster_path}/>
                <button onClick={() => handleVote(true)}>Like 👍</button>
                <button onClick={() => handleVote(false)}>Dislike 👎</button>
            </div>
            <Dialog open={dialogOpen} onClose={setDialogOpen} className={"relative z-10"}>
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                            {matchedMovie?.title} matched!
                                        </DialogTitle>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {matchedMovie?.overview}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    type="button"
                                    onClick={() => setDialogOpen(false)}
                                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                                >
                                    Continue voting
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/result/${lobby.id}`)}
                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-green-400 sm:mt-0 sm:w-auto"
                                >
                                    Finish voting
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}