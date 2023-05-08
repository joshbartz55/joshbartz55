import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Image } from 'src/app/models/image.model';
import { DomSanitizer } from '@angular/platform-browser';
var ncbi = require('node-ncbi');

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit {
  @Input() selected_info!: {pmid:number, run_id:number, cluster_id:string, cell_type:string, gene: string, cell_type2: string, cell_type3: string};
  @Input() en_id!: string | undefined;
  image: Image[];
  tsne: any;
  umap: any;
  lin_reg: any;
  title: string;
  author: string;
  year: string;

  maps = [{text: "umap"}, {text: "tsne"}, {text: "Linear Regression"}, {text: "Meta Info"}];
  display = 'umap';

  constructor(private databaseService: DatabaseService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.getClusterImages()
    this.getLinRegGraph()
  }

  getClusterImages(){
    this.databaseService.getImage(this.selected_info.pmid, this.selected_info.run_id).subscribe({
      next: (data) => {
        this.image = data;
        this.tsne = this.decodeImage(this.image[0].TSNE!)
        this.umap = this.decodeImage(this.image[0].UMAP!)
     },
      error: (e) => console.error(e)
    });
  }

  getLinRegGraph(){
    this.databaseService.getLinRegGraph(
      this.selected_info.pmid,
      this.selected_info.run_id,
      this.selected_info.cluster_id == '' ? '0' : this.selected_info.cluster_id,
      this.selected_info.cell_type.replace(/ /g,"_"),
      this.en_id!
      ).subscribe({
      next: (data) => {
        this.lin_reg = this.decodeImage(data[0].Graph!)
     },
      error: (e) => console.error(e)
    });
  }

  arrayBufferToBase64( buffer: any ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa( binary );
  }

  decodeImage(buffer: any){
    let data = buffer.data
    let base64 = this.arrayBufferToBase64(data)
    return(this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${base64}`))
  }
  onItemSelected($event: any){
    this.display = $event.itemData.text
  }

  ngOnChanges(changes: SimpleChanges){
    this.selected_info = changes['selected_info'].currentValue;
    this.formatOtherCellTypes()
    const pubmed = ncbi.pubmed;
    pubmed.summary(this.selected_info.pmid).then((results:any) => {
      this.title = results.title
      this.author = results.authors.split(',')[0].replace(' ',', ')
      this.year = results.pubDate.split('/')[0]
      console.log(this.title, this.author, this.year)
      console.log(results);
    });
    this.getClusterImages()
    this.getLinRegGraph()

  }

  formatOtherCellTypes(){
    console.log(this.selected_info.cell_type2,this.selected_info.cell_type3)
    this.selected_info.cell_type2 = this.selected_info.cell_type2 == 'NA' ? '' : (this.selected_info.cell_type2);
    this.selected_info.cell_type3 = this.selected_info.cell_type3 == 'NA' ? '' : (', '+ this.selected_info.cell_type3);
    if(this.selected_info.cell_type2 == '' && this.selected_info.cell_type3 == ''){
      this.selected_info.cell_type2 = 'None'
    }
  }

}