import {Movie} from "../model/Movie.ts";
import {getProviderId} from "../model/Provider.ts";
import {Filter} from "../model/Filter.ts";

export async function getMoviesFromPage(filter: Filter): Promise<Array<Movie>> {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization:
                'Bearer '+ import.meta.env.VITE_API_KEY
        }
    }

    const baseUrl = 'https://api.themoviedb.org/3/discover/movie?'
    const requestUrl = applyFilterToRequest(baseUrl, filter)

    return await fetch(requestUrl, options)
        .then((response) => response.json())
        .then((response) =>
            response.results.map((item: Movie) => {
                return new Movie(
                    item.adult,
                    item.backdrop_path,
                    item.genre_ids,
                    item.id,
                    item.original_language,
                    item.original_title,
                    item.overview,
                    item.popularity,
                    item.poster_path,
                    item.release_date,
                    item.title,
                    item.video,
                    item.vote_average,
                )
            })
        );
}

function applyFilterToRequest(baseUrl: string, filter: Filter): string {
    let requestUrlWithFilter = baseUrl

    requestUrlWithFilter += `include_adult=${filter.include_adult}`
    requestUrlWithFilter += `&include_video=${filter.include_video}`
    requestUrlWithFilter += `&language=${filter.language}`
    requestUrlWithFilter += `&page=${filter.pageNumber}`
    requestUrlWithFilter += `&sort_by=popularity.desc`
    requestUrlWithFilter += `&watch_region=${filter.watch_region}`

    if (filter.provider != null) {
        requestUrlWithFilter += `&with_watch_providers=`
        filter.provider.forEach(provider => {
            requestUrlWithFilter += `${getProviderId(provider).replace(' ', '')}|`
        })
        requestUrlWithFilter = requestUrlWithFilter.substring(0, requestUrlWithFilter.length - 1)
    }

    return requestUrlWithFilter
}
