import {useEffect, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {Dialog, DialogPanel, DialogBackdrop, DialogTitle} from "@headlessui/react";
import {supabase} from "../database/supabaseClient";
import Lobby from "../model/Lobby.ts";
import {Movie} from "../model/Movie.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import {faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import {movieGenres} from "../model/Genres.ts";
import {Filter} from "../model/Filter.ts";

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
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const location = useLocation();
    const { language, region, selectedProvider } = location.state || {};

    useEffect(() => {
        const fetchLobby = async () => {
            const {data, error} = await supabase
                .from("lobbies")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                throw error;
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
        const filter: Filter = {
            include_adult: false,
            language: language,
            pageNumber: page,
            watch_region: region,
            provider: selectedProvider
        }
        const url = applyFilterToRequest("https://api.movie-tinder.flix29.de?", filter)
        const response = await fetch(url, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch movies. Status:" + response.status);
        }

        const movies = await response.json();
        if (!movies || movies.length === 0 || !movies.results || movies.results.length === 0) {
            throw new Error("No movies available.");
        }

        setMovies(movies.results);
    };

    function applyFilterToRequest(baseUrl: string, filter: Filter): string {
        let requestUrlWithFilter = baseUrl

        requestUrlWithFilter += `include_adult=${filter.include_adult}`
        requestUrlWithFilter += `&language=${filter.language}`
        requestUrlWithFilter += `&page=${filter.pageNumber}`
        requestUrlWithFilter += `&sort_by=popularity.desc`
        requestUrlWithFilter += `&watch_region=${filter.watch_region}`

        if (filter.provider != null) {
            requestUrlWithFilter += `&with_watch_providers=`
            filter.provider.forEach(provider => {
                requestUrlWithFilter += `${provider.id}|`
            })
            requestUrlWithFilter = requestUrlWithFilter.substring(0, requestUrlWithFilter.length - 1)
        }

        return requestUrlWithFilter
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
            throw error;
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
    if (movies.length === 0) return <p>Loading movies...</p>;

    const currentMovie = movies[currentIndex];
    return (
        <div>
            <div
                className="absolute z-10 top-9/12 md:top-4/5 left-1/2 transform -translate-x-1/2 w-[500px] text-center">
                <div className="flex">
                    <h3 className="ms-16 md:ms-0 text-3xl font-bold dark:text-white">
                        {currentMovie.title}
                    </h3>
                    <button
                        type="button"
                        onClick={() => setDetailDialogOpen(!detailDialogOpen)}
                    >
                        <svg className="w-6 h-6 text-gray-300 self-center ms-2 opacity-80" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                             viewBox="0 0 24 24"
                        >
                            <path fillRule="evenodd"
                                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
                                  clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
                <div className="flex gap-1 ms-16 md:ms-0 mt-2 text-sm text-left">
                    {currentMovie.genre_ids.map((genreId) => {
                        if (movieGenres.has(genreId)) {
                            return <span key={genreId} className="text-white bg-gray-500 p-1 rounded-md">{movieGenres.get(genreId)}</span>;
                        } else {
                            return <span key={genreId} className="text-white bg-gray-500 p-1 rounded-md">{genreId}</span>;
                        }
                    })}
                </div>
                <div className="flex justify-center space-x-64 md:space-x-80 mt-5">
                    <button
                        className="bg-gray-500 w-12 h-12 rounded-full"
                        onClick={() => handleVote(false)}
                    >
                        <FontAwesomeIcon icon={faXmark} size="2xl" className="text-red-600 m-2"/>
                    </button>
                    <button
                        className="bg-gray-500 w-12 h-12 rounded-full"
                        onClick={() => handleVote(true)}
                    >
                        <FontAwesomeIcon icon={faThumbsUp} size="xl" className="text-maximum-green m-2"/>
                    </button>
                </div>
            </div>
            <img
                className="m-auto h-screen max-w-screen"
                src={"https://image.tmdb.org/t/p/original/" + currentMovie.poster_path}
            />
            <Dialog open={detailDialogOpen} onClose={setDetailDialogOpen} className={"relative z-20"}>
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
                            <div className="bg-white p-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center ">
                                        <DialogTitle as="h3"
                                                     className="flex justify-between text-base font-bold text-gray-900">
                                            <h3 className="text-3xl font-bold">{currentMovie.title}</h3>
                                            <button type="button"
                                                    className="text-gray-400 bg-transparent rounded-lg self-center text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-100"
                                                    onClick={() => setDetailDialogOpen(false)}>
                                                <svg className="w-3 h-3" aria-hidden="true"
                                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                    <path stroke="currentColor" strokeLinecap="round"
                                                          strokeLinejoin="round" strokeWidth="2"
                                                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                                </svg>
                                                <span className="sr-only">Close modal</span>
                                            </button>
                                        </DialogTitle>
                                        <div className="mt-4 m-2">
                                            <p className="text-sm text-left text-gray-500">
                                                {currentMovie.overview}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
            <Dialog open={dialogOpen} onClose={setDialogOpen} className={"relative z-20"}>
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