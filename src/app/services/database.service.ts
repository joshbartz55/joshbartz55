import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Metadata } from '../models/metadata.model';
import { Sample } from '../models/sample.model';
import { Positions } from '../models/positions.model';
import { DiffExp } from '../models/diffExp.model';
import { Indices } from '../models/indices.model';
import { Image } from '../models/image.model';


const baseUrl = 'http://localhost:8080/api/displaySample';
const metaUrl = 'http://localhost:8080/api/metadata';
const sampleUrl = 'http://localhost:8080/api/sample';
const positionsUrl = 'http://localhost:8080/api/positions';
const diffExpUrl = 'http://localhost:8080/api/differentialExpression';
const indicesUrl = 'http://localhost:8080/api/indices';
const imagesUrl = 'http://localhost:8080/api/images';
const linRegUrl = 'http://localhost:8080/api/linearRegression';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(baseUrl);
  }

  get(id: any): Observable<User> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  getAllDisplaySamples(): Observable<Sample[]> {
    return this.http.get<Sample[]>(sampleUrl);
  }

  getSampleInfoForHomepage(): Observable<any[]> {
    return this.http.get<any[]>(`${sampleUrl}/${'homeinfo'}`);
  }

  getSamplesTest(species: any, tissues: any, cell_types:any, age:any, health:any, pmid:any): Observable<Sample[]> {
    return this.http.get<Sample[]>(`${sampleUrl}/${species}/${tissues}/${cell_types}/${age}/${health}/${pmid}`);
  }

  getMetadata(): Observable<Metadata[]> {
    return this.http.get<Metadata[]>(metaUrl);
  }

  getInRangeGenes(start:number, end:number, chr:number): Observable<Positions[]> {
    return this.http.get<Positions[]>(`${positionsUrl}/${start}/${end}/${chr}`);
  }

  getGeneDiffExp(genes:any[]): Observable<DiffExp[]>{
    return this.http.get<DiffExp[]>(`${diffExpUrl}/${genes}`);
  }

  getIndices(): Observable<Indices[]> {
    return this.http.get<Indices[]>(indicesUrl);
  }

  getImage(pmid:number, run_id:number): Observable<Image[]> {
    return this.http.get<Image[]>(`${imagesUrl}/${pmid}/${run_id}`);
  }

  getLinRegGraph(pmid:number, run_id:number, cluster_id:string, cell_type:string, gene: string): Observable<any> {
    return this.http.get<Image[]>(`${linRegUrl}/${pmid}/${run_id}/${cluster_id}/${cell_type}/${gene}`);
  }
}
