import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})

export class DocumentationComponent implements OnInit {
  selectedFeature = 'None'
  leftButtonImage = 'None'
  rightButtonImage = 'None'
  rightButtonName = 'None'
  leftButtonName = 'None'
  constructor() { }

  ngOnInit(): void {
  }

  selectedHomePage(): void {
    this.selectedFeature = 'Home Page'
    this.leftButtonImage = '../../../assets/images/Documentation/SearchPageMain.png'; 
    this.rightButtonImage = '../../../assets/images/Documentation/GenomeBrowserMain.png';
    this.rightButtonName = 'Genome Browser'
    this.leftButtonName = 'Search Page'
  }
  selectedGenomeBrowser(): void {
    this.selectedFeature = 'Genome Browser'
    this.leftButtonImage = '../../../assets/images/Documentation/HomePageMain.png'; 
    this.rightButtonImage = '../../../assets/images/Documentation/SearchPageMain.png';
    this.rightButtonName = 'Search Page'
    this.leftButtonName = 'Home Page'
  }
  selectedSeachPage(): void {
    this.selectedFeature = 'Search Page'
    this.leftButtonImage = '../../../assets/images/Documentation/GenomeBrowserMain.png'; 
    this.rightButtonImage = '../../../assets/images/Documentation/HomePageMain.png';
    this.rightButtonName = 'Home Page'
    this.leftButtonName = 'Genome Browser'
  }

  leftButtonClicked(): void{
    switch(this.leftButtonName){
      case "Home Page":
        this.selectedHomePage()
        break
      case "Genome Browser":
        this.selectedGenomeBrowser()
        break
      case "Search Page":
        this.selectedSeachPage()
    }
  }

  rightButtonClicked(): void{
    switch(this.rightButtonName){
      case "Home Page":
        this.selectedHomePage()
        break
      case "Genome Browser":
        this.selectedGenomeBrowser()
        break
      case "Search Page":
        this.selectedSeachPage()
    }
  }
}


