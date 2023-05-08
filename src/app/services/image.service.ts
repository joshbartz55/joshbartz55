import { Injectable } from '@angular/core'    
@Injectable({
  providedIn: 'root'
})
export class ImageService {    
    allImages: any[] = [];    
    
    getImages() {    
        return this.allImages = images_delatils.slice(0);    
    }    
    
    getImage(id: number) {    
        return images_delatils.slice(0).find(Images => Images.id == id)    
    }

    getLogoImages(){
        return images_delatils.slice(1,8)
    }
}    
const images_delatils = [    
    { "id": 1, "name": 'logo', "url": "assets/images/test_logo.png" },    
    { "id": 2, "name": 'youth', "url": "assets/images/Youth.png" },    
    { "id": 3, "name": 'teen', "url": "assets/images/Teen.png" },    
    { "id": 4, "name": 'young_adult', "url": "assets/images/YA.png" },    
    { "id": 5, "name": 'adult', "url": "assets/images/Adult.png" },    
    { "id": 6, "name": 'middle_age', "url": "assets/images/MA.png" },    
    { "id": 7, "name": 'elderly', "url": "assets/images/Elderly.png" },    
    { "id": 8, "name": 'centenarian', "url": "assets/images/Cent.png" },    
]    
