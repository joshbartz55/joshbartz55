import { Component, OnInit } from '@angular/core';
import { DxTabsModule } from 'devextreme-angular';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  tabs: any[];
  selected_path = ''

  constructor() {
    this.tabs = [
      {
        id: 0,
        text: 'HOME',
        icon: 'home',
        path: 'home',
      },
      {
        id: 1,
        text: 'GENOME BROWSER',
        icon: 'verticalaligntop',
        path: 'igv',
      },
      {
        id: 2,
        text: 'SEARCH AND DOWNLOAD',
        icon: 'find',
        path: 'search',
      },
      {
        id: 3,
        text: 'DOCUMENTATION',
        icon: 'file',
        path: 'documentation',
      },
    ];
   }

  ngOnInit(): void {
  }

  selectTab($event:any){
    this.selected_path = this.tabs[$event.itemIndex].path;
  }

}
