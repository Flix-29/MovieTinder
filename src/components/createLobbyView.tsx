import {languageAndRegions} from "../model/Languages.ts";
import {useState} from "react";
import {Provider, provider} from "../model/Provider.ts";

export default function CreateLobbyView() {
    const [language, setLanguage] = useState("en-US");
    const [region, setRegion] = useState("US");
    const [onlyMainProvider, setOnlyMainProvider] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState<Array<Provider>>([]);

    function toggleProvider(provider: Provider) {
        if (selectedProvider.includes(provider)) {
            setSelectedProvider(selectedProvider.filter(item => item.id !== provider.id));
        } else {
            setSelectedProvider(selectedProvider.concat(provider));
        }
    }

    return (
        <div className="mt-40">
            <h1 className="mb-12 text-5xl font-extrabold leading-none tracking-tight lg:text-6xl">Lobby Setting</h1>
            <label>Select Language </label>
            <select
                defaultValue=""
                onChange={(language => setLanguage(language.target.value))}
                className="text-black"
            >
                <option value="" disabled>Select Language</option>
                {languageAndRegions.map((item) => (
                    <option key={item.languageAndRegionCode}
                            value={item.languageAndRegionCode}>{item.languageAndRegion}</option>
                ))}
            </select>
            <br/>
            <label>Select watch region </label>
            <select
                defaultValue=""
                onChange={(language => setRegion(language.target.value))}
                className="text-black"
            >
                <option value="" disabled>Select watch region</option>
                {languageAndRegions
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
                            <img className={`rounded-full md:w-20 md:h-20 w-15 h-15 m-auto ${selectedProvider.includes(provider) ? null : 'grayscale'}`} src={`https://image.tmdb.org/t/p/original${provider.logoPath}`}/>
                            <p className={`text-center ${selectedProvider.includes(provider) ? 'text-white' : 'text-gray-500'}`}>{provider.readableName}</p>
                        </div>
                    )) :
                    provider.map((provider) => (
                        <div
                            className="m-auto mt-0 p-2"
                            key={provider.id}
                            onClick={() => toggleProvider(provider)}
                        >
                            <img className={`rounded-full md:w-20 md:h-20 w-15 h-15 m-auto ${selectedProvider.includes(provider) ? null : 'grayscale'}`} src={`https://image.tmdb.org/t/p/original${provider.logoPath}`}/>
                            <p className={`text-center ${selectedProvider.includes(provider) ? 'text-white' : 'text-gray-500'}`}>{provider.readableName}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};