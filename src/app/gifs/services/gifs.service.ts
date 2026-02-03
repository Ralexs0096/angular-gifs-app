import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, effect } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

const GIFS_KEY = 'history';

const loadFromLocalStorage = () => {
  const gifsFromLS = localStorage.getItem(GIFS_KEY) ?? '{}';
  const gifs = JSON.parse(gifsFromLS);

  return gifs;
};

@Injectable({ providedIn: 'root' })
export class GifService {
  private http = inject(HttpClient);
  private trendingPage = signal(0);

  constructor() {
    this.loadTrendingGifs();
  }

  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(false);

  trendingGifGroup = computed<Gif[][]>(() => {
    const group = [];
    for (let i = 0; i < this.trendingGifs().length; i += 3) {
      group.push(this.trendingGifs().slice(i, i + 3));
    }

    return group;
  });

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  savedToLocalStorage = effect(() => {
    localStorage.setItem(GIFS_KEY, JSON.stringify(this.searchHistory()));
  });

  loadTrendingGifs() {
    if (this.trendingGifsLoading()) return;

    this.trendingGifsLoading.set(true);
    this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/trending`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
          offset: this.trendingPage() * 20,
        },
      })
      .subscribe((resp) => {
        const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);

        this.trendingGifs.update((currentGifs) => [...currentGifs, ...gifs]);
        this.trendingPage.update((current) => current + 1);
        this.trendingGifsLoading.set(false);
      });
  }

  searchGifs(query: string) {
    return this.http
      .get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`, {
        params: {
          api_key: environment.giphyApiKey,
          limit: 20,
          q: query,
        },
      })
      .pipe(
        map(({ data }) => GifMapper.mapGiphyItemsToGifArray(data)),
        // History
        tap((items) => {
          this.searchHistory.update((history) => ({
            ...history,
            [query.toLowerCase().trim()]: items,
          }));
        })
      );
  }

  getHistoryGifs(queryKey: string) {
    return this.searchHistory()[queryKey] ?? [];
  }
}
