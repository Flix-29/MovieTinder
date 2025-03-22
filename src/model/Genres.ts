export const movieGenres: Genre[] = [
    {id: 12, name: "Abenteuer"},
    {id: 14, name: "Fantasy"},
    {id: 16, name: "Animation"},
    {id: 18, name: "Drama"},
    {id: 27, name: "Horror"},
    {id: 28, name: "Action"},
    {id: 35, name: "Komödie"},
    {id: 36, name: "Historie"},
    {id: 37, name: "Western"},
    {id: 53, name: "Thriller"},
    {id: 80, name: "Krimi"},
    {id: 99, name: "Dokumentarfilm"},
    {id: 878, name: "Science Fiction"},
    {id: 9648, name: "Mystery"},
    {id: 10402, name: "Musik"},
    {id: 10749, name: "Liebesfilm"},
    {id: 10751, name: "Familie"},
    {id: 10752, name: "Kriegsfilm"},
    {id: 10770, name: "TV-Film"}
]

export interface Genre {
    id: number,
    name: string
}
