import {languageMap} from "../model/Languages.ts";
import {useState} from "react";

export default function CreateLobbyView() {
    const [language, setLanguage] = useState("en-US");

    return (
        <div className="mt-40">
            <h1 className="mb-12 text-5xl font-extrabold leading-none tracking-tight lg:text-6xl">Lobby Setting</h1>
            <label>Select Language</label>
            <select
                defaultValue=""
                onChange={(language => setLanguage(language.target.value))}
                className="text-black"
            >
                <option value="" disabled>Select Language</option>
                {Array.from(languageMap.entries()).map((code) => (
                    <option key={code[0]} value={code[1]}>{code[1]}</option>
                ))}
            </select>
        </div>
    );
};