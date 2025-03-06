import {supabase} from "./supabaseClient.ts";
import Lobby from "../model/Lobby.ts";

export const createLobby = async (): Promise<Lobby|null> => {
    const code = generateLobbyCode();
    const {data, error} = await supabase
        .from("lobbies")
        .insert([{name: 'Lobby-' + code, code}])
        .select()
        .single();

    if (error) {
        console.error('Error creating lobby:', error.message);
        return null
    }

    console.log(data);
    return {id:data.id, created_at: data.created_at, name: data.name, code: data.code};
};

const generateLobbyCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const joinLobbyByCode = async (code: string) => {
    const { data, error } = await supabase
        .from("lobbies")
        .select()
        .eq("code", parseInt(code))
        .single();

    if (error) {
        console.error("Error joining lobby:", error);
        return null;
    }

    return data;
};
