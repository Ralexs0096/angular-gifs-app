import { Gif } from '../interfaces/gif.interface';
import { Item } from '../interfaces/giphy.interfaces';

export class GifMapper {
  static mapGiphyItemToGif(item: Item): Gif {
    return {
      id: item.id,
      title: item.title,
      url: item.images.original.url,
    };
  }

  static mapGiphyItemsToGifArray(items: Item[]): Gif[] {
    return items.map(this.mapGiphyItemToGif);
  }
}
