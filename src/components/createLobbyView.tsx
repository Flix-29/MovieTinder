import {languageAndRegions} from "../model/Languages.ts";
import {useState} from "react";
import {Provider, provider} from "../model/Provider.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsis} from "@fortawesome/free-solid-svg-icons/faEllipsis";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import Toast from "./toast.tsx";

export default function CreateLobbyView(): React.ReactElement {
    const navigate = useNavigate();
    const [language, setLanguage] = useState<string>(navigator.language);
    const [region, setRegion] = useState<string>(navigator.language.split('-')[1]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [onlyMainProvider, setOnlyMainProvider] = useState<boolean>(true);
    const [selectedProvider, setSelectedProvider] = useState<Provider[]>([]);

    function toggleProvider(provider: Provider) {
        if (selectedProvider.includes(provider)) {
            setSelectedProvider(selectedProvider.filter(item => item.id !== provider.id));
        } else {
            setSelectedProvider(selectedProvider.concat(provider));
        }
    }

    function createLobby() {
        if (!language) {
            setErrorMessage("Please select a language");
        } else if (!region) {
            setErrorMessage("Please select a region");
        } else if (selectedProvider.length === 0) {
            setErrorMessage("Please select at least one provider");
        } else {
            return navigate("/join", {state: {language, region, selectedProvider}})
        }
    }

    return (
        <div className="h-screen mt-40">
            <h1 className="mb-12 text-5xl font-extrabold leading-none tracking-tight lg:text-6xl">Lobby Setting</h1>
            <label>Select Language </label>
            <select
                defaultValue={language}
                onChange={(language => setLanguage(language.target.value))}
                className="text-black"
            >
                <option value="" disabled>Select Language</option>
                {languageAndRegions
                    .sort((a, b) => a.languageAndRegion > b.languageAndRegion ? 1 : a.languageAndRegion < b.languageAndRegion ? -1 : 0)
                    .map((item) => (
                        <option key={item.languageAndRegionCode} value={item.languageAndRegionCode}>
                            {item.languageAndRegion}
                        </option>
                    ))}
            </select>
            <br/>
            <label>Select watch region </label>
            <select
                defaultValue={region}
                onChange={(language => setRegion(language.target.value))}
                className="text-black"
            >
                <option value="" disabled>Select watch region</option>
                {Array.from(new Map(languageAndRegions.map(item => [item.region, item])).values())
                    .sort((a, b) => a.region > b.region ? 1 : a.region < b.region ? -1 : 0)
                    .map((item) => {
                        return (
                            <option key={item.languageAndRegionCode} value={item.regionCode}>{item.region}</option>
                        )
                    })}
            </select>
            <div className="grid grid-cols-3 md:grid-cols-4 p-4 gap-2">
                {onlyMainProvider ?
                    provider.map((provider) => (
                        provider.mainProvider &&
                        <div
                            className="m-auto mt-0 p-2"
                            key={provider.id}
                            onClick={() => toggleProvider(provider)}
                        >
                            <img
                                className={`rounded-full md:w-20 md:h-20 w-15 h-15 m-auto ${selectedProvider.includes(provider) ? null : 'grayscale'}`}
                                src={`https://image.tmdb.org/t/p/original${provider.logoPath}`}
                            />
                            <p className={`text-center ${selectedProvider.includes(provider) ? 'text-white' : 'text-gray-500'}`}>{provider.readableName}</p>
                        </div>
                    )) :
                    provider.map((provider) => (
                        <div
                            className="m-auto mt-0 p-2"
                            key={provider.id}
                            onClick={() => toggleProvider(provider)}
                        >
                            <img
                                className={`rounded-full md:w-20 md:h-20 w-15 h-15 m-auto ${selectedProvider.includes(provider) ? null : 'grayscale'}`}
                                src={`https://image.tmdb.org/t/p/original${provider.logoPath}`}
                            />
                            <p className={`text-center ${selectedProvider.includes(provider) ? 'text-white' : 'text-gray-500'}`}>{provider.readableName}</p>
                        </div>
                    ))
                }{
                <div
                    className="m-auto mt-0 p-2"
                    onClick={() => setOnlyMainProvider(!onlyMainProvider)}
                >
                    <div
                        className="flex rounded-full bg-gray-500 md:w-20 md:h-20 w-15 h-15 m-auto items-center justify-center">
                        <FontAwesomeIcon icon={faEllipsis} size="3x"/>
                    </div>
                    <p className="text-center text-white">{onlyMainProvider ? "Show more" : "Show less"}</p>
                </div>
            }
            </div>
            <div className="mt-0 p-2">
                <button
                    className="bg-rebecca hover:bg-royal-purple text-white font-bold m-auto py-2 px-4 rounded"
                    onClick={() => createLobby()}
                >
                    Create Lobby
                </button>
            </div>
            {errorMessage === "" ? null : <Toast message={errorMessage}/>}
        </div>
    );
};