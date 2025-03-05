import {getMoviesFromPage} from "../logic/MovieDBRequest.ts";
import {Movie} from "../model/Movie.ts";
import {useEffect, useState} from "react";

const filter = {
    include_adult: false,
    include_video: false,
    language: 'de-DE',
    pageNumber: 1,
    watch_region: 'DE'
}

async function fetchMovies(): Promise<Movie[] | null> {
    return new Promise(resolve => setTimeout(() => resolve(getMoviesFromPage(filter)), 1000));
}

export default function Index() {
    const [data, setData] = useState<Movie[] | null>(null);

    useEffect(() => {
        async function getData() {
            const result = await fetchMovies();
            setData(result);
        }
        getData()
    }, []);

    return (
        <div>
            <h1>MovieDB</h1>
            <p>Search for movies</p>
            <div>
                {data ?
                    data.map(movie => {
                        return (
                            <div key={movie.id} className="bg-gray-700 m-2 p-2 text-white">
                                <h2>{movie.title}</h2>
                                <p>{movie.overview}</p>
                            </div>
                        )
                    })
                    : 'Loading...'
                }
            </div>
        </div>
    )
}