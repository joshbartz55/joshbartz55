import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { DatabaseService } from 'src/app/services/database.service';
import { DatabaseConstsService } from '../../services/database-consts.service'
import themes from 'devextreme/ui/themes';
import { ApexNonAxisChartSeries, ApexResponsive, ApexChart, ApexLegend, ApexDataLabels, ApexPlotOptions, ApexTheme, ApexStroke, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexGrid} from "ng-apexcharts";
import { Console } from 'console';
import * as JSZip from 'jszip';

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


interface DownloadData {
  blob: Blob;
  filename: string;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  public tissue_chart_options: Partial<DonutChartOptions>;
  public sex_chart_options: Partial<DonutChartOptions>;
  public age_chart_options: Partial<BarChartOptions>;
  public health_chart_options: Partial<DonutChartOptions>;

  tissue_dict: any = {};
  sex_dict: any = {};
  age_dict: any = {'youth':0,'teen':0,'young_adult':0,'adult':0,'middle_age':0,'elderly':0,'centenarian':0,}
  health_dict: any = {'Healthy':0, 'Cancer':0, 'Other':0, 'Unkown': 0}
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
  selectedRowData: any[] = [];
  selectedRowKeys: any[] = [];
  query_completed = false;

  maps = [{text: "Tissue"}, {text: "Sex"}, {text: "Age"}, {text: "Health"}];
  displayed_map = 'Tissue';

  download_options: { name: string; }[] = []
  selected_download_method: string;
  constructor(private databaseConstService: DatabaseConstsService, private databaseService: DatabaseService) {
    this.checkBoxesMode = themes.current().startsWith('material') ? 'always' : 'onClick';
    this.tissue_types = databaseConstService.getTissueTypes();
    //this.species = databaseConstService.getSpecies();
    //this.cell_types = databaseConstService.getCellTypes();
    this.health = ['All','Healthy', 'Cancer', 'Alzheimers']
    this.cell_types = ['All Cells','T Cells', 'B Cells', 'Macrophages', 'Endothelial Cells', 'Fibroblasts', 'Dendritic Cells']

    this.selected_tissues = this.tissue_types;
    this.selected_cells = ['All Cells'];
    this.selected_species = ["Human"];
    this.selected_age = [0,100]
    this.selected_health=['All']
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
    
    this.databaseService.getSamplesTest(this.selected_species,this.selected_tissues, this.formatForDB(this.selected_cells),this.selected_age, this.formatForDB(this.selected_health), this.pmid)
      .subscribe({
        next: (data) => {
          this.display = data;
          this.makeDictionaries()
          this.tissue_chart_options = this.makeDonutChart(this.tissue_dict)
          this.sex_chart_options = this.makeDonutChart(this.sex_dict)
          this.age_chart_options = this.makeBarChart(this.age_dict)
          this.health_chart_options = this.makeDonutChart(this.health_dict)  
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
  switchSelectedDownloadMethod($event: any){
    this.selected_download_method=$event.itemData.name
  }

  onSelectionChanged(event: any) {
    this.selectedRowKeys = event.selectedRowKeys;
    this.selectedRowData = event.selectedRowsData;
  }  

  containsAnyValue(string: string, values: string[]): boolean {
    return values.some(value => string.includes(value));
  }
  
  downloadWrapper($event: any) {
    const zip = new JSZip();
    const downloadPromises: Promise<DownloadData>[] = [];
    const downloadMethod = this.selected_download_method == this.download_options[0].name ? this.dowloadCleanData : this.dowloadRawData;
    let selected_ids = []
    for (let i = 0; i < this.selectedRowData.length; i++) {
      const id = this.selectedRowData[i].sample_id;
      selected_ids.push(id)
      const downloadPromise = downloadMethod.call(this, id);
      downloadPromises.push(downloadPromise);
    }
    let formatted_sample_ids = selected_ids.join(',');
  
    // Retrieve metadata CSV string
    const metadataPromise = this.getDownloadedMetaData(formatted_sample_ids);
  
    Promise.all([metadataPromise, ...downloadPromises]).then(([metadataCsv, ...downloads]) => {
      // Add metadata file to the zip
      zip.file('metadata.csv', metadataCsv);
  
      // Add downloaded files to the zip
      downloads.forEach(({ blob, filename }) => {
        zip.file(filename, blob);
      });
  
      // Generate zip file
      zip.generateAsync({ type: 'blob' }).then((zipBlob: Blob) => {
        saveAs(zipBlob, 'download.zip');
      });
    }).catch(error => {
      console.error('Error downloading data:', error);
    });
  }
dowloadCleanData(id: number): Promise<DownloadData> {
  return new Promise((resolve, reject) => {
    this.databaseService.getCleanData(id)
      .subscribe({
        next: (data) => {
          const csvData = data.flat().join('\n');
          const filename = 'Data_' + id + '.csv';
          const blob = new Blob([csvData], { type: 'text/csv' });
          resolve({ blob, filename });
        },
        error: (e) => {
          console.error(e);
          reject(e);
        }
      });
  });
}

dowloadRawData(id: number): Promise<DownloadData> {
  return new Promise((resolve, reject) => {
    this.databaseService.getRawData(id)
      .subscribe({
        next: (data) => {
          const csvData = data;
          const filename = 'Data_' + id + '.csv';
          const blob = new Blob([csvData], { type: 'text/csv' });
          resolve({ blob, filename });
        },
        error: (e) => {
          console.error(e);
          reject(e);
        }
      });
  });
}


  /* NEW STUFF, QUESTIONABLE */

  onItemSelected($event: any){
    this.displayed_map = $event.itemData.text
  }

  makeDictionaries(){
    let temp_tissue_dict: any = {};
    let temp_sex_dict: any = {};
    let temp_age_dict: any = {'youth':0,'teen':0,'young_adult':0,'adult':0,'middle_age':0,'elderly':0,'centenarian':0}
    let temp_health_dict: any = {'Healthy':0, 'Cancer':0, 'Other':0, 'Unkown': 0}
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
      tissue = tissue.toLowerCase()

      //tissue = this.selected_tissues.includes(tissue) ? tissue : 'other';
      //get sex info
      let sex = sample.sex
      //get health info
      let disease = sample.disease_status
      if(disease == null){
        disease = 'Unkown'
      }
      else{
        if (this.containsAnyValue(disease, ['healthy', 'normal', 'NA', 'Normal'])){
          disease = 'Healthy'
        }
        else if (this.containsAnyValue(disease, ['cancer', 'carcinoma', 'Cancer', 'melanoma'])){
          disease = 'Cancer'
        }
        else{
          disease = 'Other'
        }
      }
      //set dict values
      temp_tissue_dict[tissue] = temp_tissue_dict[tissue] ? temp_tissue_dict[tissue] + 1 : 1;
      temp_sex_dict[sex] = temp_sex_dict[sex] ? temp_sex_dict[sex] + 1 : 1;
      cell_count = cell_count + Number(sample.num_cells);
      temp_health_dict[disease] = temp_health_dict[disease] ? temp_health_dict[disease] + 1 : 1;
    }

    temp_tissue_dict = Object.entries(temp_tissue_dict);
    temp_tissue_dict = temp_tissue_dict.map(([key, value]: [string, any]) => [key.charAt(0).toUpperCase() + key.slice(1), value]);
    temp_tissue_dict.sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
    temp_tissue_dict = Object.fromEntries(temp_tissue_dict);

    this.tissue_dict = temp_tissue_dict;
    this.sex_dict = temp_sex_dict;
    this.age_dict = temp_age_dict;
    this.health_dict = temp_health_dict;
    this.cell_total = cell_count;
    console.log(this.tissue_dict)
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

  getDownloadedMetaData(formatted_sample_ids: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.databaseService.getDownloadedMetaData(formatted_sample_ids)
        .subscribe({
          next: (data) => {
            const csv = this.convertToCSV(data);
            resolve(csv);
          },
          error: (e) => {
            console.error(e);
            reject(e);
          }
        });
    });
  }
  
  convertToCSV(data: any[]) {
    const header = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(obj => {
      return Object.values(obj).map(value => {
        // If the value contains a comma or double quote, enclose it in double quotes and escape any existing double quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(',');
    });
    return header + rows.join('\n');
  }

  formatForDB(selection: string[]){
    let mod_selection = selection.map(value => value.toLowerCase().replace(/\s+/g, '_'));
    return(mod_selection)
  }
}
