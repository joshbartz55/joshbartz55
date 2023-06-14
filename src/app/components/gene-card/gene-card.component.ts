import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {ApexAxisChartSeries,ApexChart,ApexPlotOptions,ApexXAxis, ApexTitleSubtitle, ApexTooltip, ApexYAxis, ApexMarkers, ApexFill, ApexAnnotations} from "ng-apexcharts";
import { DiffExp } from 'src/app/models/diffExp.model';
import { Indices } from 'src/app/models/indices.model';
import { MapsComponent } from '../maps/maps.component';
import * as sortIds from 'sort-ids'

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
  @Input() gene!: DiffExp;
  @Input() indices!: Indices[];
  @Input() en_id!: string | undefined;
  @ViewChild('child') child: MapsComponent;

  public meta_chart_options: Partial<ChartOptions>;
  public model_chart_options: Partial<ChartOptions>;
  public pval_chart_options: Partial<ChartOptions>;
  to_map: any;
  avg_fixed_effect: String;
  avg_p_val: String;
  temp: DiffExp[] = [];
  num_studies: Number;
  model_selected = false;
  constructor() {}

  ngOnInit(): void {
    //sort by fixed effect size
    this.cleanArrays();
    this.num_studies = this.getNumUniqueStudies()
    this.temp.push(this.gene)
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
      series: [
        {
          data: [
            {
            x: 'Study 1',
            y:[this.gene.conf_low![0],this.gene.conf_high![0]]
          }
        ]
        }
      ],
      chart: {
        height: 450,
        type: "rangeBar",
        events:{
          dataPointSelection: (e, chart, opts) => {
            let selected_value = this.indices[opts.dataPointIndex]
            this.to_map = {
              pmid:selected_value.pmid,
              run_id:selected_value.run_id, 
              cluster_id:selected_value.cluster_id, 
              cell_type:selected_value.cell_type, 
              gene: this.gene.gene,
              cell_type2: selected_value.cell_type2,
              cell_type3: selected_value.cell_type3
            };
            this.model_selected = true;
          }
        },
        zoom:{
          enabled:false
        }
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      xaxis: {
        type: "numeric",
        decimalsInFloat: 3,
        labels:{
          hideOverlappingLabels:true
        } 
      },
      fill: {
        type: "pattern",
        pattern: {
          style: "verticalLines",
                  
        }
      },
      title: {
         text: this.gene.gene,
         align: "center"
       },
      tooltip:{
        custom: function() {
          return '<span>TEST</span>'
       }
      },
      annotations:{
        xaxis: [
          {
            x: 0.000,
            strokeDashArray:10,
            borderColor: 'black',
          }
        ]
      }
    };
    this.pval_chart_options = {
      series: [
        {
          name: 'pval',
          data:[]
        }
      ],
      chart: {
        height: 450,
        type: "scatter"
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      xaxis: {
        type: "numeric",
        decimalsInFloat: 3
      },
      yaxis: {
        show: false
      },
      markers: {
        size:10
      },
      title: {
         text: 'P VALUE',
         align: "center"
       },
       tooltip:{
        custom: function() {
          return '<span>TEST</span>'
       }
      },
      annotations:{
        xaxis: [
          {
            x: 1.3,
            strokeDashArray:10,
            borderColor: 'black',
          },
          {
            x: 5.3,
            strokeDashArray:10,
            borderColor: 'black',
          }
        ]
      }
    };

    this.createDisplayData()

  }

  createDisplayData(){
    let conf_levels = []
    let p_vals: {x:number, y:number, fillColor:string}[]= []
    let raw_p_vals = []
    let fixed_effect_total = []
    let p_val_total = []
    let meta_series_info = [0,0,0,0,0] //[significant decrease, slight decrease, no change, slight increase, significant increase]

    for(let i=0; i<this.gene.fixed_effect!.length; i++){
      let conf_low = this.gene.conf_low![i];
      let conf_high = this.gene.conf_high![i];
      let fixed_effect = this.gene.fixed_effect![i];
      let p_val = -1*Math.log10(Number(this.gene.p_val![i]));
      if(conf_low == 'NA' || conf_high == 'NA' || fixed_effect == 'NA'){
        continue
      }      
      if(Number(p_val) > 1.3){
        fixed_effect_total.push(Number(fixed_effect))
      }
      meta_series_info = this.updateMetaSeriesInfo(meta_series_info, Number(fixed_effect))
      p_val_total.push(Number(p_val))
      let name = this.indices[i].cell_type + '_' + this.indices[i].cluster_id
      let temp = {
        x: name,
        y:[conf_low,conf_high],
        goals: [
          {
            value: fixed_effect,
            strokeWidth: Math.abs(Number(conf_high)-Number(conf_low)) > 0.05 ? 8 : 2
          }
        ]
      }
      conf_levels.push(temp);
      raw_p_vals.push(p_val)
    }
    for(let i=0; i<raw_p_vals.length; i++){
      let fillColor = 'blue'
      if(raw_p_vals[i] > 1.3){
        fillColor = 'red'
      }
      p_vals.push({x:raw_p_vals[i],y:(raw_p_vals.length -i), fillColor:fillColor});
    }
    this.avg_fixed_effect = (fixed_effect_total.reduce((a, b) => a + b, 0) / fixed_effect_total.length).toExponential(3).toString();
    this.avg_p_val = (p_val_total.reduce((a, b) => a + b, 0) / p_val_total.length).toExponential(3).toString();
    //set meta chart options
    this.meta_chart_options.series = [
      {  
        name:'Significant Decrease',
        data:[meta_series_info[0]]
      },
      {  
        name:'Marginal Decrease',
        data:[meta_series_info[1]]
      },
      {  
        name:'No Change',
        data:[meta_series_info[2]],
        color:'#87F1FF'
      },
      {  
        name:'Marginal Increase',
        data:[meta_series_info[3]]
      },
      {  
        name:'Significant Increase',
        data:[meta_series_info[4]]
      }
    ]
    let width = p_vals.length > 20? '100%' : Math.trunc(p_vals.length * 5).toString()+'%'
    this.meta_chart_options.chart!.width = width
    //set model chart options
    this.model_chart_options.series =[{data: conf_levels}]
    this.model_chart_options.title = {text: this.gene.gene,align: "center"}
    //set pval chart options
    this.pval_chart_options.series = [{name:'test', data: p_vals}]
    this.pval_chart_options.yaxis = {
      show: false,
      max: p_vals.length + 0.5,
      min: 0.5,
      tickAmount: p_vals.length
    }
    this.pval_chart_options.xaxis = {
      type: "numeric",
      decimalsInFloat: 3,
      max: Math.ceil(Math.max.apply(Math, raw_p_vals)),
      min: Math.floor(Math.min.apply(Math, raw_p_vals))
    }
    //Set Heights of Fixed Effect and P Value Graphs
    let scaler = conf_levels.length > 15 ? conf_levels.length : 15
    let height = (scaler * 15).toString() + 'px'
    this.pval_chart_options.chart!.height = height
    this.model_chart_options.chart!.height = height
  }

  updateMetaSeriesInfo(info: number[], fixed_effect: number){
    let i = -1
    if(fixed_effect <= -0.1){
      i = 0
    }
    else if(fixed_effect>-0.1 && fixed_effect< -0.5){
      i = 1
    }
    else if(fixed_effect>=-0.5 && fixed_effect<= 0.5){
      i = 2
    }
    else if(fixed_effect>0.5 && fixed_effect< 0.1){
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
    let temp = [];
    for(let i = 0; i<this.indices.length; i++){
      temp.push(this.indices[i].pmid)
    }
    let set = new Set(temp)
    return(set.size)
  }

  cleanArrays(){
    let ordered_ids = sortIds(this.gene.fixed_effect);
    let num_values = this.gene.fixed_effect!.length;
    for(let i = 0; i < this.gene.fixed_effect!.length; i++){
      let value = this.gene.fixed_effect![i];
      num_values = value=='NA' ? (num_values-1): num_values;
    }
    ordered_ids = ordered_ids.slice(0,num_values);
    this.gene.fixed_effect = this.reorder(this.gene.fixed_effect, ordered_ids)
    this.gene.conf_high = this.reorder(this.gene.conf_high, ordered_ids)
    this.gene.conf_low = this.reorder(this.gene.conf_low, ordered_ids)
    this.gene.p_val = this.reorder(this.gene.p_val, ordered_ids)
    this.indices = this.reorder(this.indices, ordered_ids)
  }
}