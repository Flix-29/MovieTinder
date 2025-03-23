import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Dialog, DialogPanel, DialogBackdrop, DialogTitle} from "@headlessui/react";
import {supabase} from "../database/supabaseClient";
import Lobby from "../model/Lobby.ts";
import {Movie} from "../model/Movie.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import {faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import {movieGenres} from "../model/Genres.ts";
import {
    createMatch,
    createVote,
    fetchFilterForLobby,
    fetchLobbyById,
    fetchVotesForLobbyAndMovieId
} from "../database/supabaseConnector.ts";
import {fetchMoviesFiltered} from "../backend/backendConnector.ts";

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

    useEffect(() => {
        const fetchLobby = async () => {
            if (!id) return;

            await fetchLobbyById(id).then(setLobby)
            setLoading(false);
        };

        if (!lobby) {
            fetchLobby();
        }

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
    }, [id, page, lobby]);

    useEffect(() => {
        if (lobby) {
            fetchMovies(); // TODO: maybe load next set of movies in the background to avoid waiting, load page 1 and 2 initially and then load page 3 when page 1 is done.
        }
    }, [lobby, page]);

    useEffect(() => {
        const likeSubscription = supabase
            .channel("vote_updates")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "votes",
                filter: `lobby_id=eq.${lobby?.id}`
            }, async (payload) => {
                if (!lobby || !lobby.id) {
                    return
                }

                const votes = await fetchVotesForLobbyAndMovieId(lobby.id, payload.new.movie_id)
                if (votes && votes.length >= 2) {
                    const movie = movies.find(movie => movie.id === parseInt(payload.new.movie_id));
                    if (movie) {
                        await createMatch(lobby.id, movie)
                        setMatchedMovie(movie)
                        setDialogOpen(true)
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(likeSubscription);
        }
    }, [lobby, movies, lobby?.id]);

    const fetchMovies = async () => {
        if (lobby && lobby.id) {
            const filter = await fetchFilterForLobby(lobby.id);
            filter.pageNumber = page;
            await fetchMoviesFiltered(filter).then(setMovies)
        }
    };

    const handleVote = async (liked: boolean) => {
        if (!lobby) return;
        await createVote(lobby.id, movies[currentIndex].id.toString(), liked)
        setCurrentIndex(await getNextIndex());
    }

    async function getNextIndex(): Promise<number> {
        if (currentIndex + 1 >= movies.length) {
            setPage(prevPage => prevPage + 1);
            return 0;
        }
        return currentIndex + 1;
    }

    if (loading) return <p>Loading lobby...</p>;
    if (!lobby) return <p>Lobby not found</p>;
    if (!lobby.started) return <p>Waiting for host to start...</p>; // TODO: Beautify, loading spinner
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
                        if (movieGenres.find(genre => genre.id === genreId)) {
                            return <span key={genreId} className="text-white bg-gray-500 p-1 rounded-md">
                                {movieGenres.find(genre => genre.id === genreId)?.name}
                            </span>;
                        } else {
                            return <span key={genreId} className="text-white bg-gray-500 p-1 rounded-md">
                                {genreId}
                            </span>;
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