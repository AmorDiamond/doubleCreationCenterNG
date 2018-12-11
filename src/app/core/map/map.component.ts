import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { Amap } from '../../core/amap-ngrx/amap.model';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

declare var AMap: any;
declare var AMapUI: any;
// declare var $: any;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-map',
  template: `<div id='t-amap' class='t-amap'></div>`,
  styleUrls: ['map.component.css']
})
export class MapComponent implements OnInit {

  tagState$: Observable<Amap>;
  constructor(private store: Store<Amap>,
    private router: Router,
  ) {
    this.tagState$ = this.store.pipe(select('amap'));
  }

  AMAPOBJ: any;
  amap: any;
  action: any;
  dataPolygonTopCateLands: any = {};
  dataPolygonEcoCateLands: any = {};
  topRank: any;
  defaultBorderColor = "#8ee3a2";
  defaultLandColor = "transparent";
  dataPolygonAlls: any;
  nowPolygonType: any;
  pointSimplifierIns: any;
  companyAddressMarkerList = [];


  ngOnInit() {
    // this.tagState$.subscribe((state: Amap) => {
    //   console.log(this.AMAPOBJ);
    // });
    setTimeout(() => {
      const map = new AMap.Map('t-amap', {
        // features: ['bg', 'road', 'building']
      });
      this.AMAPOBJ = map;
      this.AMAPOBJ.on('click', e => {
        const lnglatXY = [e.lnglat.getLng(), e.lnglat.getLat()];
        const geocoder = new AMap.Geocoder({
          radius: 1000,
          extensions: 'all'
        });
        geocoder.getAddress(lnglatXY, function(status, result) {
          console.log(lnglatXY, status, result)
          if (status === 'complete' && result.info === 'OK') {
            const address = result.regeocode.formattedAddress; // 返回地址描述
            console.log(address);
          }
        });
      });
      /*let district;
      district = new AMap.DistrictSearch({
        level: 'district',
        extensions: 'all'
      });
      /!*先搜索成都市的所有行政区*!/
      district.search('成都市', (status, result) => {
        if (status === 'complete') {
          const areaList = result.districtList[0].districtList;
          areaList.forEach(item => {
            if (item.name) {
              /!*再通过行政区的adcode区搜索范围*!/
              district.search(item.adcode, (areaStatus, areaResult) => {
                if (areaStatus === 'complete') {
                  const areaData = areaResult.districtList[0];
                  if (areaData.name) {
                    this.getAreaData(areaData);
                  }
                }
              });
            }
          });
        }
      });*/
      this.action = {
        'openInfo': (data) => {
          const infoWindow = new AMap.InfoWindow({
            content: data.contentArray.join('<br/>')  // 使用默认信息窗体框样式，显示信息内容
          });
          infoWindow.open(map, map.getCenter());
        },
        'ADD_MARKER': (data) => {
          data.forEach((item, index) => {
            const marker = new AMap.Marker({
              position: item.center.split(','),
              title: item.name,
              map: map,
              content: `<div class="mapMarker"><span>${item.name}</span></div>`
            });
            marker.on('click', () => {
              console.log(marker.getTitle());
              // console.log(marker.F.title);
              // this.microcosmicService.changeData(marker.getTitle());
            });
          });
          map.setFitView();
          // map.panBy(-580, 10);
        },
        'ADD_MARKER_MID': (data) => {
          /*判断是否存在海量点layer，有就清空显示*/
          if (this.pointSimplifierIns) {
            this.pointSimplifierIns.setData();
          }
          data.forEach((item, index) => {
            const marker = new AMap.Marker({
              position: item.center.split(','),
              title: item.name,
              map: map,
              content: `<div class="mapMarker"><span>${item.name}</span></div>`
            });
            marker.on('click', (e) => {
              console.log(marker.F.title);
              console.log(e);
              marker.setContent(`<div class="mapMarker active"><span>${item.name}</span></div>`);
              // this.intermediateService.changeParkName(marker.F.title);
              /*点击中观园区进入园区数据看板*/
              this.router.navigate(['/int/industryBoard/parkMenu/registMoney']);
            });
          });
          map.setFitView();
          // map.setZoom(12);
          map.panBy(-580, 10);
        },
        'ADD_POLYGON': (datas) => {
          map.clearMap();
          const data = datas.type ? datas.type : datas;
          const time = datas.time ? datas.time : '';
          const getNew = datas.flag ? datas.flag : false;
        },
        'ADD_SINGLE_POLYGON': (datas) => {
          map.clearMap();
          const data = datas.type;
          const industryStatus = datas.industry;
        },
        'ADD_INDUSTRY_MAP_POLYGON': (data) => {
          const type = data.type;
          const options = data.data ? data.data : '';
          const updated = data.updated ? data.updated : false;
          if (this.nowPolygonType == type && !updated) {
            map.setFitView();
            map.panBy(-580, 10);
            return;
          }
          this.nowPolygonType = type;
          map.clearMap();
          console.log('map', this.pointSimplifierIns);
          /*判断是否存在海量点layer，有就清空显示*/
          if (this.pointSimplifierIns) {
            this.pointSimplifierIns.setData();
          }
          map.setFitView();
          map.panBy(-580, 10);
        },
        'ADD_BUILD_MARKER': (data) => {
          map.off('zoomend', function (e) {
            console.log(e);
          });
        },
        'ADD_COMPANY_ADDRESS': (datas) => {
          console.log('ADD_COMPANY_ADDRESS', datas);
          map.remove(this.companyAddressMarkerList)
          this.creatCompanyAddress(datas);
        },
        'CLEAR_MARKER': (data) => {
          map.clearMap();
        }
      };
      this.tagState$.subscribe((state: Amap) => {
        if (state.action) {
          this.action[state.action](state.data);
        }
      });
      map.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, // 是否使用高精度定位，默认:true
          timeout: 10000,          // 超过10秒后停止定位，默认：无穷大
          maximumAge: 0,           // 定位结果缓存0毫秒，默认：0
          convert: true,           // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
          viewMode: '3D',
          zoom: '12',
          showButton: false,        // 显示定位按钮，默认：true
          buttonPosition: 'LB',    // 定位按钮停靠位置，默认：'LB'，左下角
          buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          showMarker: true,        // 定位成功后在定位到的位置显示点标记，默认：true
          showCircle: true,        // 定位成功后用圆圈表示定位精度范围，默认：true
          panToLocation: true,     // 定位成功后将定位到的位置作为地图中心点，默认：true
          zoomToAccuracy: true     // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
        map.addControl(geolocation);
      });
      /*AMap.event.addListener(map, 'zoomend', function(){
        const zoom = map.getZoom();
        const markers = map.getAllOverlays('marker');
        if (zoom <= 12) {
            markers.forEach(function(item, index) {
                item.show();
            });
        } else {
            markers.forEach(function(item, index) {
                item.hide();
            });
        }
        // map.getAllOverlays('marker')[0].hide()
    });*/
    }, 200);

  }
  formatEcoTopLandsData(options) {
    const pointsArr = [];
    const allLandsDataPointsArr = [];
    for(let n=0; n<options.length-1; n++){
      const last = options[n].last;
      const top = options[n].top;
      for (let i=0;i<last.length;i++){
        // pointsArr.push(res[i].points);
        const point_x_y = [];
        const pointItem: any = {id:"",position:"",inefficient:"",landArea:"",landUsrNature:""};
        for(let j=0;j<last[i].points.length;j++){
          point_x_y.push([last[i].points[j].point_80_x,last[i].points[j].point_80_y]);
        }
        pointItem.type = "last";
        pointItem.landType = last[i].enterpriseType;
        pointItem.id = last[i].id;
        pointItem.unifiedLandMark = last[i].unifiedLandMark;
        pointItem.rightHolder = last[i].rightHolder;
        pointItem.landIsLocated = last[i].landIsLocated;
        pointItem.inefficient = last[i].inefficient;
        pointItem.actualUsers = last[i].actualUsers;
        pointItem.pricepermeter = last[i].pricepermeter;
        pointItem.landCardNumber = last[i].landCardNumber;
        /*按性质分类*/
        pointItem.generalType = last[i].generalType;
        /*实测面积*/
        pointItem.landArea = last[i].landArea;
        /*使用全面积*/
        pointItem.usageArea = last[i].usageArea;
        pointItem.landUsrNature = last[i].landUsrNature;
        pointItem.position = point_x_y;
        pointsArr.push(pointItem);
      }

      for (let l=0;l<top.length;l++){
        // pointsArr.push(res[i].points);
        var point_x_y = [];
        var pointItem: any = {id:"",position:"",inefficient:"",landArea:"",landUsrNature:""};
        for(var m=0;m<top[l].points.length;m++){
          point_x_y.push([top[l].points[m].point_80_x,top[l].points[m].point_80_y]);
        }
        pointItem.id = top[l].id;
        pointItem.type = "top";
        pointItem.landType = top[l].enterpriseType;
        pointItem.unifiedLandMark = top[l].unifiedLandMark;
        pointItem.rightHolder = top[l].rightHolder;
        pointItem.landIsLocated = top[l].landIsLocated;
        pointItem.inefficient = top[l].inefficient;
        pointItem.actualUsers = top[l].actualUsers;
        pointItem.pricepermeter = top[l].pricepermeter;
        pointItem.landCardNumber = top[l].landCardNumber;
        /*按性质分类*/
        pointItem.generalType = top[l].generalType;
        /*实测面积*/
        pointItem.landArea = top[l].landArea;
        /*使用全面积*/
        pointItem.usageArea = top[l].usageArea;
        pointItem.landUsrNature = top[l].landUsrNature;
        pointItem.position = point_x_y;
        pointsArr.push(pointItem);
      }
    }

    const allLandsData = options[options.length - 1];
    for(let i=0;i<allLandsData.length;i++){
      // pointsArr.push(res[i].points);
      const point_x_y = [];
      const pointItem: any = {id:"",position:"",inefficient:"",landArea:"",landUsrNature:""};
      for(var j=0;j<allLandsData[i].points.length;j++){
        point_x_y.push([allLandsData[i].points[j].point_80_x,allLandsData[i].points[j].point_80_y]);
      }
      pointItem.id = allLandsData[i].id;
      pointItem.unifiedLandMark = allLandsData[i].unifiedLandMark;
      pointItem.rightHolder = allLandsData[i].rightHolder;
      pointItem.actualUsers = allLandsData[i].actualUsers;
      pointItem.landIsLocated = allLandsData[i].landIsLocated;
      pointItem.inefficient = allLandsData[i].inefficient;
      pointItem.isSingle = allLandsData[i].isSingle;
      pointItem.landCardNumber = allLandsData[i].landCardNumber;
      /*按性质分类*/
      pointItem.generalType = allLandsData[i].generalType;
      /*实测面积*/
      pointItem.landArea = allLandsData[i].landArea;
      /*使用全面积*/
      pointItem.usageArea = allLandsData[i].usageArea;
      pointItem.landUsrNature = allLandsData[i].landUsrNature;
      pointItem.position = point_x_y;
      allLandsDataPointsArr.push(pointItem);
    }
    this.dataPolygonAlls = allLandsDataPointsArr;
    const allOptions = allLandsDataPointsArr;
    for (let i = 0; i < pointsArr.length; i++) {
      for (let j = 0; j < allOptions.length; j++) {
        if (pointsArr[i].unifiedLandMark == allOptions[j].unifiedLandMark) {
          allOptions.splice(j, 1);
          break;
        }
      }
    }
    const dataPolygonTopLands = allOptions.concat(pointsArr);
    return dataPolygonTopLands;
  }
  formatEcoOutputLandsData(options) {
    const landsData = options;
    const pointsArr = [];
    const allLandsDataPointsArr = [];
    for (let n=0; n<landsData.length - 1; n++) {
      const firstLv = landsData[n].firstGradient;
      const secondLv = landsData[n].secondGradient;
      const thirdLv = landsData[n].thirdGradient;
      // console.log(res)
      for(let i=0;i<firstLv.length;i++){
        // pointsArr.push(res[i].points);
        var point_x_y = [];
        var pointItem: any = {id:"",position:"",enterpriseType:"",landArea:"",landUsrNature:""};
        for(var j=0;j<firstLv[i].points.length;j++){
          point_x_y.push([firstLv[i].points[j].point_80_x,firstLv[i].points[j].point_80_y]);
        }
        pointItem.id = firstLv[i].id;
        pointItem.unifiedLandMark = firstLv[i].unifiedLandMark;
        pointItem.rightHolder = firstLv[i].rightHolder;
        pointItem.landIsLocated = firstLv[i].landIsLocated;
        pointItem.enterpriseType = firstLv[i].enterpriseType;
        pointItem.ecoLv = 1;
        pointItem.actualUsers = firstLv[i].actualUsers;
        pointItem.pricepermeter = firstLv[i].pricepermeter;
        pointItem.landCardNumber = firstLv[i].landCardNumber;
        /*按性质分类*/
        pointItem.generalType = firstLv[i].generalType;
        /*实测面积*/
        pointItem.landArea = firstLv[i].landArea;
        /*使用全面积*/
        pointItem.usageArea = firstLv[i].usageArea;
        pointItem.landUsrNature = firstLv[i].landUsrNature;
        pointItem.position = point_x_y;
        pointsArr.push(pointItem);
      }
      for(var i=0;i<secondLv.length;i++){
        // pointsArr.push(res[i].points);
        var point_x_y = [];
        var pointItem: any = {id:"",position:"",enterpriseType:"",landArea:"",landUsrNature:""};
        for(var j=0;j<secondLv[i].points.length;j++){
          point_x_y.push([secondLv[i].points[j].point_80_x,secondLv[i].points[j].point_80_y]);
        }
        pointItem.id = secondLv[i].id;
        pointItem.unifiedLandMark = secondLv[i].unifiedLandMark;
        pointItem.rightHolder = secondLv[i].rightHolder;
        pointItem.landIsLocated = secondLv[i].landIsLocated;
        pointItem.enterpriseType = secondLv[i].enterpriseType;
        pointItem.ecoLv = 2;
        pointItem.actualUsers = secondLv[i].actualUsers;
        pointItem.pricepermeter = secondLv[i].pricepermeter;
        pointItem.landCardNumber = secondLv[i].landCardNumber;
        /*按性质分类*/
        pointItem.generalType = secondLv[i].generalType;
        /*实测面积*/
        pointItem.landArea = secondLv[i].landArea;
        /*使用全面积*/
        pointItem.usageArea = secondLv[i].usageArea;
        pointItem.landUsrNature = secondLv[i].landUsrNature;
        pointItem.position = point_x_y;
        pointsArr.push(pointItem);
      }
      for(var i=0;i<thirdLv.length;i++){
        // pointsArr.push(res[i].points);
        var point_x_y = [];
        var pointItem: any = {id:"",position:"",enterpriseType:"",landArea:"",landUsrNature:""};
        for(var j=0;j<thirdLv[i].points.length;j++){
          point_x_y.push([thirdLv[i].points[j].point_80_x,thirdLv[i].points[j].point_80_y]);
        }
        pointItem.id = thirdLv[i].id;
        pointItem.unifiedLandMark = thirdLv[i].unifiedLandMark;
        pointItem.rightHolder = thirdLv[i].rightHolder;
        pointItem.landIsLocated = thirdLv[i].landIsLocated;
        pointItem.enterpriseType = thirdLv[i].enterpriseType;
        pointItem.ecoLv = 3;
        pointItem.actualUsers = thirdLv[i].actualUsers;
        pointItem.pricepermeter = thirdLv[i].pricepermeter;
        pointItem.landCardNumber = thirdLv[i].landCardNumber;
        /*按性质分类*/
        pointItem.generalType = thirdLv[i].generalType;
        /*实测面积*/
        pointItem.landArea = thirdLv[i].landArea;
        /*使用全面积*/
        pointItem.usageArea = thirdLv[i].usageArea;
        pointItem.landUsrNature = thirdLv[i].landUsrNature;
        pointItem.position = point_x_y;
        pointsArr.push(pointItem);
      }
    }

    const allLandsData = landsData[landsData.length - 1];
    for(let i=0;i<allLandsData.length;i++){
      // pointsArr.push(res[i].points);
      const point_x_y = [];
      const pointItem: any = {id:"",position:"",inefficient:"",landArea:"",landUsrNature:""};
      for(var j=0;j<allLandsData[i].points.length;j++){
        point_x_y.push([allLandsData[i].points[j].point_80_x,allLandsData[i].points[j].point_80_y]);
      }
      pointItem.id = allLandsData[i].id;
      pointItem.unifiedLandMark = allLandsData[i].unifiedLandMark;
      pointItem.rightHolder = allLandsData[i].rightHolder;
      pointItem.actualUsers = allLandsData[i].actualUsers;
      pointItem.landIsLocated = allLandsData[i].landIsLocated;
      pointItem.inefficient = allLandsData[i].inefficient;
      pointItem.isSingle = allLandsData[i].isSingle;
      pointItem.landCardNumber = allLandsData[i].landCardNumber;
      /*按性质分类*/
      pointItem.generalType = allLandsData[i].generalType;
      /*实测面积*/
      pointItem.landArea = allLandsData[i].landArea;
      /*使用全面积*/
      pointItem.usageArea = allLandsData[i].usageArea;
      pointItem.landUsrNature = allLandsData[i].landUsrNature;
      pointItem.position = point_x_y;
      allLandsDataPointsArr.push(pointItem);
    }
    this.dataPolygonAlls = allLandsDataPointsArr;
    const allOptions = allLandsDataPointsArr;

    for (let i = 0; i < pointsArr.length; i++) {
      for (let j = 0; j < allOptions.length; j++) {
        if (pointsArr[i].unifiedLandMark == allOptions[j].unifiedLandMark) {
          allOptions.splice(j, 1);
          break;
        }
      }
    }
    const dataPolygonEcoLands = allOptions.concat(pointsArr);
    return dataPolygonEcoLands;
  }
  /*绘制行政区*/
  getAreaData(data, level?) {
    const polygons = [];
    const bounds = data.boundaries;
    const map = this.AMAPOBJ;
    if (bounds) {
      const areaText = new AMap.Text({
        text: data.name,
        map: map,
        zIndex: 1,
        position: data.center,
        style: {
          'background': 'none',
          'border': 'none',
        }
      });
      for (let i = 0, l = bounds.length; i < l; i++) {
        const polygon = new AMap.Polygon({
          map: map,
          strokeWeight: 1,
          strokeColor: '#CC66CC',
          fillColor: '#CCF3FF',
          fillOpacity: 0.5,
          path: bounds[i]
        });
        polygons.push(polygon);
      }
      // map.setFitView(); // 地图自适应
    }
  }
  /*绘制企业位置*/
  creatCompanyAddress(options) {
    const companyList = [];
    const map = this.AMAPOBJ;
    console.log(options)
    options.forEach(item => {
      const position = item.address.split(',');
      const name = item.company;
      const marker = new AMap.Marker({
        position: position,
        // title: name,
        map: map,
        zIndex: 999,
        icon: new AMap.Icon({
          size: new AMap.Size(40, 50),  // 图标大小
          image: '../assets/images/build_position_icon.png',
          // imageOffset: new AMap.Pixel(0, -60),
          imageSize: new AMap.Size(40, 50)
        }),
        extData: {
          name: item.company
        }
      });
      this.companyAddressMarkerList.push(marker);
      marker.on('mouseover', (e) => {
        console.log('over', e)
        const markerObj = e.target;
        let name = markerObj.getExtData().name;
        let position = markerObj.getPosition();
        console.log('over', name)
        const infoWindow = new AMap.InfoWindow({
          autoMove: true,
          content: name,
          position: position,
          offset: new AMap.Pixel(-5 , -20),
          showShadow: true
        });
        infoWindow.open(map);
      });
      marker.on('mouseout', () => {
        map.clearInfoWindow();
      });
      marker.on('click', (e) => {
        map.clearInfoWindow();
        const markerObj = e.target;
        let name = markerObj.getExtData().name;
        this.router.navigate(['/mic/companyDetail/basic/company-profile'], { queryParams: { name: name } });
      });
    });

    map.setFitView(); // 地图自适应
    map.panBy(-300, 40);
  }
}
