export class Movie {
  private _adult: boolean
  private _backdrop_path: string
  private _genre_ids: []
  private _id: number
  private _original_language: string
  private _original_title: string
  private _overview: string
  private _popularity: number
  private _poster_path: string
  private _release_date: string
  private _title: string
  private _video: boolean
  private _vote_average: number

  public constructor(
    adult: boolean,
    backdrop_path: string,
    genre_ids: [],
    id: number,
    original_language: string,
    original_title: string,
    overview: string,
    popularity: number,
    poster_path: string,
    release_date: string,
    title: string,
    video: boolean,
    vote_average: number
  ) {
    this._adult = adult
    this._backdrop_path = backdrop_path
    this._genre_ids = genre_ids
    this._id = id
    this._original_language = original_language
    this._original_title = original_title
    this._overview = overview
    this._popularity = popularity
    this._poster_path = poster_path
    this._release_date = release_date
    this._title = title
    this._video = video
    this._vote_average = vote_average
  }

  get adult(): boolean {
    return this._adult
  }

  set adult(value: boolean) {
    this._adult = value
  }

  get backdrop_path(): string {
    return this._backdrop_path
  }

  set backdrop_path(value: string) {
    this._backdrop_path = value
  }

  get genre_ids(): [] {
    return this._genre_ids
  }

  set genre_ids(value: []) {
    this._genre_ids = value
  }

  get id(): number {
    return this._id
  }

  set id(value: number) {
    this._id = value
  }

  get original_language(): string {
    return this._original_language
  }

  set original_language(value: string) {
    this._original_language = value
  }

  get original_title(): string {
    return this._original_title
  }

  set original_title(value: string) {
    this._original_title = value
  }

  get overview(): string {
    return this._overview
  }

  set overview(value: string) {
    this._overview = value
  }

  get popularity(): number {
    return this._popularity
  }

  set popularity(value: number) {
    this._popularity = value
  }

  get poster_path(): string {
    return this._poster_path
  }

  set poster_path(value: string) {
    this._poster_path = value
  }

  get release_date(): string {
    return this._release_date
  }

  set release_date(value: string) {
    this._release_date = value
  }

  get title(): string {
    return this._title
  }

  set title(value: string) {
    this._title = value
  }

  get video(): boolean {
    return this._video
  }

  set video(value: boolean) {
    this._video = value
  }

  get vote_average(): number {
    return this._vote_average
  }

  set vote_average(value: number) {
    this._vote_average = value
  }

  static emptyMovie(): Movie {
    return new Movie(false, '', [], 0, '', '', '', 0, '', '', '', false, 0)
  }
}
