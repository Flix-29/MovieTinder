import {Provider} from "./Provider.ts";

export interface Filter {
    language: string
    pageNumber: number
    watch_region: string
    provider: Provider[]
}
