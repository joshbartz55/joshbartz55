import { Component, OnInit } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { DatabaseService } from 'src/app/services/database.service';
import { ApexNonAxisChartSeries, ApexResponsive, ApexChart, ApexLegend, ApexDataLabels, ApexPlotOptions, ApexTheme, ApexStroke} from "ng-apexcharts";

export type ChartOptions = {
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  charts_ready = false;
  selected_age_group = 'none';
  tissue_list = ['kidney','human bone marrow', 'pancreas', 'placenta', 'lung', 'blood', 'dermis']
  public tissue_chart_options: Partial<ChartOptions>;
  public sex_chart_options: Partial<ChartOptions>;
  sample_info: any[];
  tissue_dict: any = {};
  sex_dict: any = {};
  age_dict: any = {'youth':0,'teen':0,'young_adult':0,'adult':0,'middle_age':0,'elderly':0,'centenarian':0,}
  logo_list: any[];
  cell_total: number;
  min_age = -1
  max_age = 1000
  options = [
    {
      title: 'Our Mission',
      text: 'SCALIWAG is designed to provide the gerontology community with a large repository of single cell RNA sequencing(scRNA-seq) data to further a wide range of studies on aging. Donor information, like health and age, are includedfor each of the over XXX samples in SCALIWAG.  Datasets in SCALIWAG can be sorted using a wide range of filters, including age, and can be downloaded in their original, unclean formats or in SCALIWAG\'s standard, cleaned format (for more information see Documentation).  Additionally, SALIWAG offers a genome browser tool that can be used to assertain how age effects gene expression in healthy human tissue.'
    },
    {
      title: 'Citation',
      text: 'TBD'
    }
  ]
  
  constructor(private imageService: ImageService, private databaseService: DatabaseService) {
    this.databaseService.getSampleInfoForHomepage().subscribe({
      next: (data) => {
        this.sample_info = data;
        this.makeDictionaries()
        this.tissue_chart_options = this.makeChart(this.tissue_dict)
        this.sex_chart_options = this.makeChart(this.sex_dict)
        this.charts_ready = true
      },
      error: (e) => console.error(e)
    });
    this.logo_list = this.imageService.getLogoImages()

   }

  ngOnInit(): void {
    
  }

  test(age_group: any){
    if(this.selected_age_group == age_group){
      this.selected_age_group = 'None' 
       this.min_age = -1
       this.max_age = 1000
     }
     else{
      switch (age_group){
        case 'youth':
          this.min_age = -1;
          this.max_age = 10;
          break;
        case 'teen':
          this.min_age = 11;
          this.max_age = 19;
          break;
        case 'young_adult':
          this.min_age = 20;
          this.max_age = 29;
          break;
        case 'adult':
          this.min_age = 30;
          this.max_age = 49;
          break;
        case 'middle_age':
          this.min_age = 50;
          this.max_age = 64;
          break;
        case 'elderly':
          this.min_age = 65;
          this.max_age = 99;
          break;
        case 'centenarian':
          this.min_age = 100;
          this.max_age = 1000;
          break;
      }
      this.selected_age_group = age_group;
     }
     for(let i = 0; i < this.logo_list.length; i ++){
      this.logo_list[i].url = this.logo_list[i].name == this.selected_age_group ? [this.logo_list[i].url.slice(0,-4),"_selected",this.logo_list[i].url.slice(-4)].join('') : this.logo_list[i].url.replace("_selected", "");
    }
    this.makeDictionaries();
    this.tissue_chart_options.series = Object.values(this.tissue_dict);
    this.tissue_chart_options.labels = Object.keys(this.tissue_dict);
    this.sex_chart_options.series = Object.values(this.sex_dict);
    this.sex_chart_options.labels = Object.keys(this.sex_dict);
  }

  makeDictionaries(){
    let temp_tissue_dict: any = {};
    let temp_sex_dict: any = {};
    let temp_age_dict: any = {'youth':0,'teen':0,'young_adult':0,'adult':0,'middle_age':0,'elderly':0,'centenarian':0,}
    let cell_count = 0;
    
    for(let i=0; i<this.sample_info.length; i++){
      let sample = this.sample_info[i];
      let age = this.getAge(sample.age)

      //Get Age information to always be displayed
      let age_group = this.getAgeGroup(age);
      temp_age_dict[age_group] = temp_age_dict[age_group] + 1;
      
      if(age < this.min_age || age > this.max_age){
        continue;
      }
      //get tissue info
      let tissue = sample.tissue.includes('blood') ? 'blood' : sample.tissue;
      tissue = tissue.toLowerCase()
      //get tissue info
      let sex = sample.sex

      //set values
      temp_tissue_dict[tissue] = temp_tissue_dict[tissue] ? temp_tissue_dict[tissue] + 1 : 1;
      temp_sex_dict[sex] = temp_sex_dict[sex] ? temp_sex_dict[sex] + 1 : 1;
      cell_count = cell_count + Number(sample.num_cells);
    }
    console.log(temp_tissue_dict)
    temp_tissue_dict = Object.entries(temp_tissue_dict);
    temp_tissue_dict = temp_tissue_dict.map(([key, value]: [string, any]) => [key.charAt(0).toUpperCase() + key.slice(1), value]);
    temp_tissue_dict.sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
    temp_tissue_dict = Object.fromEntries(temp_tissue_dict);

    this.tissue_dict = temp_tissue_dict;
    this.sex_dict = temp_sex_dict;
    this.age_dict = temp_age_dict;
    this.cell_total = cell_count;
  }
  makeChart(input_dict: any){
    let chart: Partial<ChartOptions> = {
      series: Object.values(input_dict),
      chart: {
        type: "donut",
        height: '550',
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
                color: ' #E85A4F'
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

  getAge(age:any){
    let ret_age = -10
    if(age.toLowerCase().includes('w')){
      ret_age = 0
    }
    else if(age.includes('-')){
      let ages = age.split('-')
      ret_age  = (Number(ages[0]) + Number(ages[1]))/2
    }
    else {
      ret_age = Number(age)
    }
    return(ret_age)
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
  prettify(input_name:string){
    input_name = input_name.replace("_", " ")
    const words = input_name.split(" ");
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].slice(1);
    }
    return(words.join(" "));
  }
}
