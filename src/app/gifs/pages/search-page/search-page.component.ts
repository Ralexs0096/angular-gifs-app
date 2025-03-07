import { Component } from '@angular/core';
import { GifsListComponent } from '../../components/gifs-list/gifs-list.component';

@Component({
  selector: 'app-search-page',
  imports: [GifsListComponent],
  templateUrl: './search-page.component.html',
})
export default class SearchPageComponent {
  onSearch(query: string) {
    console.log({ query });
  }
}
