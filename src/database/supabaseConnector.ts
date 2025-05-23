import {supabase} from "./supabaseClient.ts";
import Lobby from "../model/Lobby.ts";
import {Match} from "../model/Match.ts";
import Vote from "../model/Vote.ts";
import {Movie} from "../model/Movie.ts";
import {Filter} from "../model/Filter.ts";

export const createLobby = async (): Promise<Lobby | null> => {
    const code = generateLobbyCode();
    const {data, error} = await supabase
        .from("lobbies")
        .insert([{name: 'Lobby-' + code, code}])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return {id: data.id, created: data.created, name: data.name, code: data.code, started: data.started};
};

export const fetchLobbyById = async (lobbyId: string): Promise<Lobby> => {
    const {data, error} = await supabase
        .from("lobbies")
        .select("*")
        .eq("id", lobbyId)
        .single();

    if (error) {
        throw error;
    }

    return {id: data.id, created: data.created, name: data.name, code: data.code, started: data.started};
};

const generateLobbyCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const joinLobbyByCode = async (code: string) => {
    const {data, error} = await supabase
        .from("lobbies")
        .select()
        .eq("code", parseInt(code))
        .single();

    if (error) {
        return null;
    }

    return data;
};

export const startLobbyWithId = async (lobbyId: string) => {
    const {error} = await supabase
        .from("lobbies")
        .update({started: true})
        .eq("id", lobbyId)

    if (error) {
        throw error;
    }
}

export const fetchMatchesForLobby = async (lobbyId: string | undefined): Promise<Match[]> => {
    const {data, error} = await supabase
        .from("matches")
        .select()
        .eq("lobby_id", lobbyId)

    if (error) {
        throw error;
    }

    return data;
}

export const fetchVotesForLobbyAndMovieId = async (lobbyId: string, movieId: string): Promise<Vote[]> => {
    const {error, data} = await supabase
        .from("votes")
        .select()
        .eq("lobby_id", lobbyId)
        .eq("movie_id", movieId)
        .eq("vote", true);

    if (error) {
        throw error;
    }

    return data;
}

export const createMatch = async (lobbyId: string, movie: Movie) => {
    const {error} = await supabase
        .from("matches")
        .upsert({
            lobby_id: lobbyId,
            movie_id: movie.id,
            title: movie.title,
            description: movie.overview
        }, {
            ignoreDuplicates: false,
            onConflict: 'lobby_id, movie_id'
        })

    if (error) {
        throw error;
    }
}

export const createVote = async (lobbyId: string, movieId: string, vote: boolean) => {
    const {error} = await supabase
        .from("votes")
        .upsert([
            {
                lobby_id: lobbyId,
                user_id: 'ff90c61b-1fb9-4bbe-98d1-89b1dc0bfca8',
                movie_id: movieId,
                vote: vote
            }
        ]);

    if (error) {
        throw error;
    }
}

export const createFilter = async (lobbyId: string, filter: Filter) => {
    const {error} = await supabase
        .from("filter")
        .upsert({
            lobby_id: lobbyId,
            language: filter.language,
            watch_region: filter.watch_region,
            provider: JSON.stringify(filter.provider)
        });

    if (error) {
        throw error;
    }
}

export const fetchFilterForLobby = async (lobbyId: string): Promise<Filter> => {
    const {data, error} = await supabase
        .from("filter")
        .select()
        .eq("lobby_id", lobbyId)
        .single();

    if (error) {
        throw error;
    }

    return {
        language: data.language,
        pageNumber: 1,
        watch_region: data.watch_region,
        provider: JSON.parse(data.provider)
    };
}
