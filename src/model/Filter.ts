import {Provider} from "./Provider.ts";

export interface Filter {
  include_adult: boolean
  include_video: boolean
  language: string
  pageNumber: number
  watch_region: string
  provider?: Provider[]
}
