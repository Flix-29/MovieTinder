export default interface Vote {
    id: string;
    movieId: number;
    lobbyId: string;
    vote: boolean;
    userId: string;
}