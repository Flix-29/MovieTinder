import {Filter} from "../model/Filter.ts";
import {Movie} from "../model/Movie.ts";

export async function fetchMoviesFiltered(filter: Filter): Promise<Movie[]> {
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

    return movies.results;
}

function applyFilterToRequest(baseUrl: string, filter: Filter): string {
    let requestUrlWithFilter = baseUrl

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