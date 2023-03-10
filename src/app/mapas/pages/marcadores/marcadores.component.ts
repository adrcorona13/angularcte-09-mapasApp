import { Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorCustom {
  color?: string;
  marcador?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container{
        height: 100%;
        width: 100%;
      }
      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999;
      }
      li{
        cursor: pointer;
      }
    `
  ]
})
export class MarcadoresComponent {
  @ViewChild('mapa')
  mapContainer!: ElementRef;

  map!: mapboxgl.Map;

  zoomLevel: number = 15;

  center: [number, number] = [-99.1240, 19.4426];

  marcadores: MarcadorCustom[] = [];

  ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.center, // starting position [lng, lat]
      zoom: this.zoomLevel, // starting zoom
    });

    this.leerMarcadores();

    // const markerHtml: HTMLElement = document.createElement('div');
    // markerHtml.innerHTML = "hola mundo"

    // const marker = new mapboxgl.Marker({
    //   element: markerHtml
    // })
    // .setLngLat(this.center)
    // .addTo(this.map);

    
  }

  irMarcador(index: number) {

    const marcador = this.marcadores[index];

    this.map.flyTo({
      center: marcador.marcador!.getLngLat()
    })
  }

  agregarMarcador() {
    const color = "#xxxxxx".replace(/x/g, y => (Math.random() * 16 | 0).toString(16));

    const marcador = new mapboxgl.Marker({
      draggable: true,
      color
    })
      .setLngLat(this.center)
      .addTo(this.map)
    this.marcadores.push({ color, marcador });

    this.guardarMarcadoresLocalStorage();

    marcador.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    })
  }

  borrarMarcador(index: number){
    this.marcadores[index].marcador?.remove();
    this.marcadores[index].marcador?.off('dragend');
    this.marcadores.splice(index, 1);
    this.guardarMarcadoresLocalStorage();
  }

  guardarMarcadoresLocalStorage() {

    const arr: MarcadorCustom[] = [];

    this.marcadores.forEach(m => {
      const color = m.color;
      const { lng, lat } = m.marcador!.getLngLat()
      arr.push({
        color,
        centro: [lng, lat]
      })
    })

    localStorage.setItem('marcadores', JSON.stringify(arr));
  }


  leerMarcadores(){
    if (!localStorage.getItem('marcadores')) {
      return;
    }
    const arr: MarcadorCustom[] = JSON.parse(localStorage.getItem('marcadores')!);
    console.log(arr);

    arr.forEach(m=> {
      const marcador = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      })
      .setLngLat(m.centro!)
      .addTo(this.map);
      this.marcadores.push({
        marcador,
        color: m.color
      });
      marcador.on('dragend', () => {
        this.guardarMarcadoresLocalStorage();
      })
    });
    
  }
}
