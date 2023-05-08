import { Component, OnInit } from '@angular/core';
import { DisplaySample } from 'src/app/models/displaySample';
import { Metadata } from 'src/app/models/metadata.model';
import { Sample } from 'src/app/models/sample.model';
import { User } from 'src/app/models/user.model';
import { DatabaseService } from 'src/app/services/database.service';
import { DatabaseConstsService } from '../../services/database-consts.service'
import themes from 'devextreme/ui/themes';
import { ApexNonAxisChartSeries, ApexResponsive, ApexChart, ApexLegend, ApexDataLabels, ApexPlotOptions, ApexTheme, ApexStroke, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexGrid} from "ng-apexcharts";

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  legend: ApexLegend;
  data_labels: ApexDataLabels;
  options: ApexPlotOptions;
  theme: ApexTheme;
  stroke: ApexStroke;
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  legend: ApexLegend;
  data_labels: ApexDataLabels;
  options: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  colors: string[];
};



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  public tissue_chart_options: Partial<DonutChartOptions>;
  public sex_chart_options: Partial<DonutChartOptions>;
  public age_chart_options: Partial<BarChartOptions>;

  tissue_dict: any = {};
  sex_dict: any = {};
  age_dict: any = {'youth':0,'teen':0,'young_adult':0,'adult':0,'middle_age':0,'elderly':0,'centenarian':0,}
  cell_total: number;
  min_age = -1
  max_age = 1000

  tissue_types: string[] = [];
  cell_types: string[] = [];
  species: string[] = [];
  health: string[] = [];

  selected_tissues: string[] = [];
  selected_cells: string[] = [];
  selected_species: string[] = [];
  selected_age: number[] = [];
  selected_health: string[] = []
  pmid: string;

  tooltip: any;
  checkBoxesMode: string;
  /*display might need to be display? */
  display: any[];
  query_completed = false;

  maps = [{text: "Tissue"}, {text: "Sex"}, {text: "Age"}, {text: "Health"}];
  displayed_map = 'Tissue';

  download_options: { name: string; }[] = []
  selected_download_method: string;
  constructor(private databaseConstService: DatabaseConstsService, private databaseService: DatabaseService) {
    this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
    this.tissue_types = databaseConstService.getTissueTypes();
    this.cell_types = databaseConstService.getCellTypes();
    //Temp for testing
    this.tissue_types = databaseConstService.getTissueTypes()
    this.cell_types = ['t_cells']
    this.health = ['Healthy']
    this.selected_tissues = this.tissue_types;
    this.selected_cells = this.cell_types;
    this.species = databaseConstService.getSpecies();
    this.selected_species = ["Human"];
    this.selected_age = [0,100]
    this.selected_health=this.health
    this.tooltip = {
      enabled: true,
      showMode: 'always',
      position: 'bottom',
    };

    this.download_options = [{name:'Download Clean Data'},{name:'Download Raw Data'}]
    this.selected_download_method = this.download_options[0].name

  }

  ngOnInit(): void {
  }

  runQuery() {
    this.databaseService.getAllDisplaySamples()
      .subscribe({
        next: (data) => {
          this.display = data;
          this.query_completed = true
        },
        error: (e) => console.error(e)
      });
  }

  samplesTest() {
    if(this.selected_species.length == 0){
      this.selected_species = this.species
    }
    if(this.selected_tissues.length == 0){
      this.selected_tissues = this.tissue_types
    }
    if(this.selected_cells.length == 0){
      this.selected_cells = this.cell_types
    }
    if(this.selected_health.length == 0){
      this.selected_health = ["Healthy"];
    }
    this.databaseService.getSamplesTest(this.selected_species,this.selected_tissues, this.selected_cells,this.selected_age, this.selected_health, this.pmid)
      .subscribe({
        next: (data) => {
          this.display = data;
          this.makeDictionaries()
          this.tissue_chart_options = this.makeDonutChart(this.tissue_dict)
          this.sex_chart_options = this.makeDonutChart(this.sex_dict)
          this.age_chart_options = this.makeBarChart(this.age_dict)
          this.query_completed = true
        },
        error: (e) => console.error(e)
      });
  }

  onTissuesChanged($event: any){
    this.selected_tissues = $event.value
  }
  onCellsChanged($event: any){
    this.selected_cells = $event.value
  }  
  onSpeciesChanged($event: any){
    this.selected_species = $event.value
  }
  onAgeChanged($event: any){
    this.selected_age = $event.value
  }
  onHealthChanged($event: any){
    this.selected_health = $event.value
  }
  onItemClick($event: any){
    this.selected_download_method=$event.itemData.name
    console.log(this.selected_download_method)
  }
  download($event: Event){
    console.log($event)
  }

  /* NEW STUFF, QUESTIONABLE */

  onItemSelected($event: any){
    this.displayed_map = $event.itemData.text
  }

  makeDictionaries(){
    let temp_tissue_dict: any = {};
    let temp_sex_dict: any = {};
    let temp_age_dict: any = {'youth':0,'teen':0,'young_adult':0,'adult':0,'middle_age':0,'elderly':0,'centenarian':0,}
    let cell_count = 0;
    
    for(let i=0; i<this.display.length; i++){
      let sample = this.display[i];
      let age = sample.age.includes('fetal')? 0 : sample.age;
      

      //Get Age information to always be displayed
      let age_group = this.getAgeGroup(age);
      temp_age_dict[age_group] = temp_age_dict[age_group] + 1;

      if(age < this.min_age || age > this.max_age){
        continue;
      }

      //get tissue info
      let tissue = sample.tissue.includes('blood') ? 'blood' : sample.tissue;
      //tissue = this.selected_tissues.includes(tissue) ? tissue : 'other';

      //get tissue info
      let sex = sample.sex



      //set values
      temp_tissue_dict[tissue] = temp_tissue_dict[tissue] ? temp_tissue_dict[tissue] + 1 : 1;
      temp_sex_dict[sex] = temp_sex_dict[sex] ? temp_sex_dict[sex] + 1 : 1;
      cell_count = cell_count + Number(sample.num_cells);
    }
    this.tissue_dict = temp_tissue_dict;
    this.sex_dict = temp_sex_dict;
    this.age_dict = temp_age_dict;
    this.cell_total = cell_count;
  }
  makeDonutChart(input_dict: any){
    let chart: Partial<DonutChartOptions> = {
      series: Object.values(input_dict),
      chart: {
        type: "donut",
        height: '425',
      },
      legend: {
        show:false
      },
      labels: Object.keys(input_dict),
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ],
      data_labels: {
        formatter: function (val, opts) {
            return opts.w.config.labels[opts.seriesIndex]
        },
        style:{
          fontSize: '16px'
        }
      },
      options:{
        pie:{
          donut:{
            labels:{
              show:true,
              total:{
                show:true,
                label:"Total Samples",
                fontSize: '30px',
                fontWeight: 700,
                color: '#E85A4F'
              },
              value:{
                fontFamily: 'RobotoCondensed-Bold',
                fontSize: '50px',
                color: '#8E8D8A',
                fontWeight: 600,
                offsetY: 25
              }
            }
          }
        }
      },
      theme:{
        monochrome:{
          enabled:true,
          color: '#E85A4F',
          shadeTo:'dark',
          shadeIntensity: 0.55
        }
      },
      stroke:{
        width:2,
        colors: ['#E0DCCC']
      }
    };
    return(chart)
  }

  makeBarChart(input_dict: any){
    let age_names = Object.keys(input_dict)
    let age_count = Object.values(input_dict)
    let chart: Partial<BarChartOptions> = {
      series: [
        {
          name: "Age",
          data: [
            {
              x: age_names[0],
              y: age_count[0],
            },
            {
              x: age_names[1],
              y: age_count[1],
            },
            {
              x: age_names[2],
              y: age_count[2],
            },
            {
              x: age_names[3],
              y: age_count[3],
            },
            {
              x: age_names[4],
              y: age_count[4],
            },
            {
              x: age_names[5],
              y: age_count[5],
            },
            {
              x: age_names[6],
              y: age_count[6],
            }
          ]
        }
      ],
      chart: {
        height: 400,
        type: "bar",
        foreColor:"#E85A4F"
      },
      options: {
        bar: {
          columnWidth: "80%"
        }
      },
      data_labels: {
        enabled: true,
        style: {
          fontSize: '35px',
          fontFamily: 'RobotoCondensed-Bold',
          fontWeight: 600,
          colors:[
            function ({ w, dataPointIndex }:any) {
              console.log(dataPointIndex)
              console.log(w.config.series[0].data[dataPointIndex])
              if (w.config.series[0].data[dataPointIndex].y > 0) {
                return "white";
              } else {
                return "#8E8D8A";
              }
            },
          ]
      },
      },
      legend: {
        show: false,
      },
      xaxis:{
        labels:{
          style:{
            fontSize: '15px',
            fontWeight: 700
            
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
      },
      yaxis:{
        show:false,
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
      },
      grid:{
        yaxis:{
          lines:{
            show:false
          }
        }
      },
      colors:['#E85A4F']
    };
    return(chart)
  }

  getAgeGroup(age:number){
    if(age < 11){
      return('youth')
    }
    else if(age < 20){
      return('teen')
    }
    else if(age < 30){
      return('young_adult')
    }
    else if(age < 50){
      return('adult')
    }
    else if(age < 65){
      return('middle_age')
    }
    else if(age < 100){
      return('elderly')
    }
    return('centenarian')
  }

  formatRow($event: any){
    console.log($event)
    if($event.rowType == 'header'){
      $event.rowElement.style.backgroundColor = "#EAE7DC";
      $event.rowElement.style.color = "black";
      $event.rowElement.style.fontWeight = 700;


    }
    else if($event.key % 2 == 0){
      $event.rowElement.style.backgroundColor = "#EAE7DC";
    }
    else{
      $event.rowElement.style.backgroundColor = "#E0DCCC";
    }
  }

}
