import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {ApexAxisChartSeries,ApexChart,ApexPlotOptions,ApexXAxis, ApexTitleSubtitle, ApexTooltip, ApexYAxis, ApexMarkers, ApexFill, ApexAnnotations} from "ng-apexcharts";
import { DiffExp } from 'src/app/models/diffExp.model';
import { Indices } from 'src/app/models/indices.model';
import { MapsComponent } from '../maps/maps.component';
import * as sortIds from 'sort-ids'
import { max } from 'rxjs';

export type ChartOptions = {
   series: ApexAxisChartSeries;
   chart: ApexChart;
   xaxis: ApexXAxis;
   yaxis: ApexYAxis;
   plotOptions: ApexPlotOptions;
   fill: ApexFill;
   title: ApexTitleSubtitle;
   tooltip: ApexTooltip;
   markers: ApexMarkers;
   annotations: ApexAnnotations;
 };
@Component({
  selector: 'app-gene-card',
  templateUrl: './gene-card.component.html',
  styleUrls: ['./gene-card.component.css']
})
export class GeneCardComponent implements OnInit {
  @Input() gene_list: DiffExp[];
  @Input() indices!: Indices[];
  //@Input() en_id!: string | undefined;
  @ViewChild('child') child: MapsComponent;

  public meta_chart_options: Partial<ChartOptions>;
  public model_chart_options: Partial<ChartOptions>;
  to_map: any;
  avg_fixed_effect: String;
  avg_p_val: String;
  temp: DiffExp[] = [];
  num_studies: Number;
  en_id: string;
  model_selected = false;
  constructor() {}

  ngOnInit(): void {
    //sort by fixed effect size
    //this.cleanArrays();
    console.log(this.gene_list)
    this.num_studies = this.getNumUniqueStudies()
    this.temp.push(this.gene_list[0])
    let temp_string = "00000000000" + this.gene_list[0].gene?.toString()
    this.en_id = "ENSG" + temp_string.slice(-11)
    this.meta_chart_options = {
      series: [
        {  
          name:'BAD',
          data:[4]
        },
        {  
          name:'Good',
          data:[1]
        }
      ],
      chart: {
        type: "bar",
        height:'100%',
        stacked:true,
        sparkline: {
          enabled: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      xaxis: {
        labels: {
          show: false,
        },
        categories:[''],
        tickAmount: 0,
        position: 'top',
        axisBorder:{
          show: false
        },
        axisTicks:{
          show: false
        }
      },
      yaxis: {
        show: false,
        labels: {
          show: false
        },
      },
      fill: {
        type: "pattern",
        pattern: {
          style: "verticalLines",
                  
        }
      },
    };
    this.model_chart_options = {
      series: [{
        name: this.gene_list[0].gene?.toString(),
        data: [],
      }
      ],
      chart: {
        height:450,
        type: "scatter",
        events:{
          dataPointSelection: (e, chart, opts) => {
            let slected_gene = this.gene_list[opts.dataPointIndex]
            this.to_map = {
              pmid:slected_gene.pmid,
              cell_type:slected_gene.cell_type, 
              gene: slected_gene.gene,
              cell_type2: slected_gene.cell_type2,
              cell_type3: slected_gene.cell_type3,
              slope: slected_gene.slope,
              intercept: slected_gene.inter,
              g_id: slected_gene.plotting_id
            };
            this.model_selected = true;
          }
        },
        zoom:{
          enabled:false
        }
      },
      xaxis: {
        tooltip:{
          formatter: function(val, opts){
            return val.toString()
          }
        },
        //type: "numeric",
        tickAmount: 10,
          min: -10,
          max: 10
      },
      markers:{
        size: 10
      },
      yaxis:{
        min:0,
        max:10
      },
      fill: {
        type: "pattern",
        pattern: {
          style: "verticalLines",
                  
        }
      },
      title: {
         text: this.gene_list[0].gene!.toString(),
         align: "center"
       },
      tooltip:{
        enabled: false
      },
      annotations:{
        yaxis: [
          {
            y: 1.30103,
            strokeDashArray:10,
            borderColor: 'black',
          }
        ]
      }
    };
    this.createDisplayData()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gene_list'] && !changes['gene_list'].firstChange) {
      // Update charts when gene_list input changes
      this.createDisplayData();
      console.log(this.gene_list)
    }
  }

  createDisplayData(){
    let model_data = []
    let meta_series_info = [0,0,0,0,0] //[significant decrease, slight decrease, no change, slight increase, significant increase]
    let cluster_number = this.gene_list.length;
    let min_lfc = Number.POSITIVE_INFINITY
    let max_lfc = Number.NEGATIVE_INFINITY
    for(let i=0; i<cluster_number; i++){
      let gene = this.gene_list[i]
      let p_value = -Math.log10(gene.p_value!)
      meta_series_info = this.updateMetaSeriesInfo(meta_series_info, Number(gene.lfc))
      let fill_color = p_value! >= 1.30103 ? 'blue' : 'red'; 
      let formatted_data = {x: Number(gene.lfc), y: p_value, fillColor: fill_color}
      model_data.push(formatted_data)
      min_lfc = gene.lfc! < min_lfc ? gene.lfc! : min_lfc;
      max_lfc = gene.lfc! > max_lfc ? gene.lfc! : max_lfc;
    }
    min_lfc = min_lfc - 1
    max_lfc = max_lfc + 1
    //Setup MetaChart
    this.meta_chart_options.chart!.width =  cluster_number > 20? '100%' : Math.trunc(cluster_number * 5).toString()+'%'
    this.meta_chart_options.series = [
      {name: "Significantly Downregulated",
      data: [meta_series_info[0]]
      },
      {name: "Slightly Downregulated",
      data: [meta_series_info[1]]
      },
      {name: "No Change",
      data: [meta_series_info[2]]
      },
      {name: "Slightly Upregulated",
      data: [meta_series_info[3]]
      },
      {name: "Significantly Upregulated",
      data: [meta_series_info[4]]
      },
    ]
    //Setup ModelChart
    this.model_chart_options.series =[{data: model_data}]
    //this.model_chart_options.title = {text: this.gene_list[0].gene!.toString(),align: "center"}
    //this.model_chart_options.xaxis = {min: min_lfc, max: max_lfc}
    //Set Heights Model Graph
    let scaler = cluster_number > 15 ? cluster_number : 15
    let height = (scaler * 15).toString() + 'px'
    //this.model_chart_options.chart!.height = height
  }
  // createDisplayData(){
  //   let p_vals: {x:number, y:number, fillColor:string}[]= []
  //   let p_val_total = []
  //   let all_lfc = []
  //   let meta_series_info = [0,0,0,0,0] //[significant decrease, slight decrease, no change, slight increase, significant increase]
  //   let cluster_number = this.gene_list.length;

  //   for(let i=0; i<cluster_number; i++){
  //     let gene = this.gene_list[i]

  //     meta_series_info = this.updateMetaSeriesInfo(meta_series_info, Number(gene.lfc))
  //     let name = gene.cell_type
  //     let temp = {
  //       x: name,
  //       y:[gene.lfc,gene.lfc],
  //       goals: [
  //         {
  //           value: gene.lfc,
  //           //strokeWidth: Math.abs(Number(conf_high)-Number(conf_low)) > 0.05 ? 8 : 2
  //         }
  //       ]
  //     }
  //     all_lfc.push(temp);
  //   for(let i=0; i<raw_p_vals.length; i++){
  //     let fillColor = 'blue'
  //     if(raw_p_vals[i] > 1.3){
  //       fillColor = 'red'
  //     }
  //     p_vals.push({x:raw_p_vals[i],y:(raw_p_vals.length -i), fillColor:fillColor});
  //   }
  //   this.avg_fixed_effect = (fixed_effect_total.reduce((a, b) => a + b, 0) / fixed_effect_total.length).toExponential(3).toString();
  //   this.avg_p_val = (p_val_total.reduce((a, b) => a + b, 0) / p_val_total.length).toExponential(3).toString();
  //   //set meta chart options
  //   this.meta_chart_options.series = [
  //     {  
  //       name:'Significant Decrease',
  //       data:[meta_series_info[0]]
  //     },
  //     {  
  //       name:'Marginal Decrease',
  //       data:[meta_series_info[1]]
  //     },
  //     {  
  //       name:'No Change',
  //       data:[meta_series_info[2]],
  //     },
  //     {  
  //       name:'Marginal Increase',
  //       data:[meta_series_info[3]]
  //     },
  //     {  
  //       name:'Significant Increase',
  //       data:[meta_series_info[4]]
  //     }
  //   ]
  //   let width = p_vals.length > 20? '100%' : Math.trunc(p_vals.length * 5).toString()+'%'
  //   this.meta_chart_options.chart!.width = width
  //   //set model chart options
  //   this.model_chart_options.series =[{data: conf_levels}]
  //   this.model_chart_options.title = {text: this.gene.gene!.toString(),align: "center"}
  //   //set pval chart options
  //   this.pval_chart_options.series = [{name:'test', data: p_vals}]
  //   this.pval_chart_options.yaxis = {
  //     show: false,
  //     max: p_vals.length + 0.5,
  //     min: 0.5,
  //     tickAmount: p_vals.length
  //   }
  //   this.pval_chart_options.xaxis = {
  //     type: "numeric",
  //     decimalsInFloat: 3,
  //     max: Math.ceil(Math.max.apply(Math, raw_p_vals)),
  //     min: Math.floor(Math.min.apply(Math, raw_p_vals))
  //   }
  //   //Set Heights of Fixed Effect and P Value Graphs
  //   let scaler = conf_levels.length > 15 ? conf_levels.length : 15
  //   let height = (scaler * 15).toString() + 'px'
  //   this.pval_chart_options.chart!.height = height
  //   this.model_chart_options.chart!.height = height
  //   }
  // }
  updateMetaSeriesInfo(info: number[], lfc: number){
    let i = -1
    if(lfc <= -1){
      i = 0
    }
    else if(lfc>-1 && lfc< -0.5){
      i = 1
    }
    else if(lfc>=-0.5 && lfc<= 0.5){
      i = 2
    }
    else if(lfc>0.5 && lfc< 1){
      i = 3
    }
    else{
      i = 4
    }

    info[i] = info[i]+1;
    return(info)
  }

  reorder(list: any, ids: any){
    let new_list = []
    for(let i = 0; i<ids.length; i++){
      let id = ids[i]
      new_list.push(list[id])
    }
    return(new_list)
  }
  getNumUniqueStudies(){
    let pmids = []
    for(let i = 0; i<this.gene_list.length; i++){
      pmids.push(this.gene_list[i].pmid)
    }
    let set = new Set(pmids)
    return(set.size)
  }

  // cleanArrays(){
  //   let ordered_ids = sortIds(this.gene.fixed_effect);
  //   let num_values = this.gene.fixed_effect!.length;
  //   for(let i = 0; i < this.gene.fixed_effect!.length; i++){
  //     let value = this.gene.fixed_effect![i];
  //     num_values = value=='NA' ? (num_values-1): num_values;
  //   }
  //   ordered_ids = ordered_ids.slice(0,num_values);
  //   this.gene.fixed_effect = this.reorder(this.gene.fixed_effect, ordered_ids)
  //   this.gene.conf_high = this.reorder(this.gene.conf_high, ordered_ids)
  //   this.gene.conf_low = this.reorder(this.gene.conf_low, ordered_ids)
  //   this.gene.p_val = this.reorder(this.gene.p_val, ordered_ids)
  //   this.indices = this.reorder(this.indices, ordered_ids)
  // }
}
