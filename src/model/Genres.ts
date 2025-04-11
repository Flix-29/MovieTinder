export const movieGenres: Genre[] = [
    {id: 12, name: "Abenteuer", color: "#7B9E89"},
    {id: 14, name: "Fantasy", color: "#927FBF"},
    {id: 16, name: "Animation", color: "#F0AFAF"},
    {id: 18, name: "Drama", color: "#8C8C8C"},
    {id: 27, name: "Horror", color: "#5A3E3E"},
    {id: 28, name: "Action", color: "#B05E59"},
    {id: 35, name: "Komödie", color: "#C9A66B"},
    {id: 36, name: "Historie", color: "#9B8B7B"},
    {id: 37, name: "Western", color: "#A67C52"},
    {id: 53, name: "Thriller", color: "#4F4F6F"},
    {id: 80, name: "Krimi", color: "#6D6D7E"},
    {id: 99, name: "Dokumentarfilm", color: "#7A928F"},
    {id: 878, name: "Science Fiction", color: "#5D7E95"},
    {id: 9648, name: "Mystery", color: "#6F5D7E"},
    {id: 10402, name: "Musik", color: "#B98E99"},
    {id: 10749, name: "Liebesfilm", color: "#D8A0A6"},
    {id: 10751, name: "Familie", color: "#A0BBAF"},
    {id: 10752, name: "Kriegsfilm", color: "#707050"},
    {id: 10770, name: "TV-Film", color: "#808080"}
]

export interface Genre {
    id: number,
    name: string,
    color: string
}
