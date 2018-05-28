import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { File } from '@ionic-native/file';

import "leaflet";
import "leaflet-tilelayer-mbtiles-ts";


declare var L: any;
declare var window;

@Component({
  selector: 'page-home-map-off',
  templateUrl: 'home-map-off.html'
})
export class HomeMapOffPage {

  @ViewChild('homeMapOff') mapContainer: ElementRef;
  public avatar: string;
  map: L.Map;
  center: L.PointTuple;

  contactName;
  townName;

  constructor(
    public navCtrl: NavController, 
    public file: File,
    public sqlite: SQLite,
    public navParams: NavParams
  ) {

  }

  ionViewDidEnter() {
    let id = this.navParams.get('id_contact');
    this.contactName = this.navParams.get('name'); 
    this.townName = this.navParams.get('town_name');  

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, (fileSys) => {
      fileSys.root.getDirectory('avatar', {create: false}, (directory) => {  
        this.file.checkFile(this.file.externalRootDirectory + 'avatar/', id + '.jpg').then((files) => { 
          this.avatar = this.file.externalRootDirectory + 'avatar/' +  id + '.jpg';
        }).catch((err) => { this.avatar = 'assets/imgs/user.png'; });
      },(error) => { this.avatar = 'assets/imgs/user.png'; });
    },(error) => { this.avatar = 'assets/imgs/user.png'; });

    this.sqlite.create({
      name: 'my.db',
      location: 'default'
    }).then((db: SQLiteObject) => { 
      db.executeSql('SELECT coordx, coordy FROM contacts WHERE id_contact ='+id, {})
      .then(res => {
        this.initMap(res.rows.item(0).coordx,res.rows.item(0).coordy);
      }).catch(e => { console.log(e) });
    }).catch(e => console.log(e));
  }

  initMap(lat,long) {

    this.center = [lat,long]; 
    this.map = L.map('homeMapOff', {
      center: this.center,
      zoom: 9
    });

    let mb = L.tileLayer.mbTiles('assets/tiles/myFile.mbtiles', {
      minZoom: 9,
      maxZoom: 12
    }).addTo(this.map); 

    mb.on('databaseloaded', function(ev) {
      console.info('MBTiles DB loaded', ev); 
    }); 

    mb.on('databaseerror', function(ev) {
      console.info('MBTiles DB error', ev); 
    });

    this.map.locate({
      setView: true,
      maxZoom: 12
    }).on('locationfound', (e) => {  
      let marker = L.marker([lat, long]).bindPopup('Home location');
      this.map.addLayer(marker);

    }).on('locationerror', (err) => {
      alert(err);
    });  
  }

}
