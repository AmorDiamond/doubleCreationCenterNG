import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataRequestService {

  constructor(
    private http: HttpClient
  ) { }
  /*孵化器列表*/
  // private incubatorListUrl = '/v1/platform/hatcheryController/findByPage';
  private incubatorListUrl = '/v1/platform/hatcheryController/findByName';
  /*孵化器详情*/
  private incubatorDetailUrl = '/v1/platform/hatcheryController/';
  /*孵化园列表*/
  private incubationParkListUrl = '';
  /*孵化园详情*/
  private incubationParkDetailUrl = '';
  /*科技中介服务机构列表*/
  // private technologyIntermediaryUrl = '/v1/platform/technologyIntermediary/findByParams';
  private technologyIntermediaryUrl = '/v1/platform/technologyIntermediary/findByParamsNotPage';
  /*科技中介服务机构详情*/
  private technologyIntermediaryDetailUrl = '/v1/platform/technologyIntermediary/findById';
  /*公共技术平台列表*/
  // private technologyPlatformUrl = '/v1/platform/ptp/findByParams';
  private technologyPlatformUrl = '/v1/platform/ptp/findByParamsNotPage';
  /*公共技术平台详情*/
  private technologyPlatformDetailUrl = '/v1/platform/ptp/findById';
  /*获取企业列表*/
  private enterpriseListUrl = '/v1/platform/company/findByParams';
  /*获取企业详情*/
  private enterpriseListDetailUrl = '/v1/platform/company/findById';
  /*搜索列表*/
  private searchUrl = '/v1/solr/findByParams';
  /*园区企业列表*/
  private getCompanyByLandUrl = '/v1/platform/landBlockController/findCompanyByLand';

  /*enterpriseMarks = {
    home: 'enterprise_mark_point.png',
    technology: 'kejiqiye_enterprise_point_icon.png',
    doubleVenture: 'shuangchuangqiye_mark_point.png',
    seedEnterprise: 'zhongzi_mark_point.png',
    gazelleEnterprise: 'denglin_mark_point.png',
    unicornEnterprise: 'dujiaoshou_mark_point.png',
    intermediary: 'kejizhongjie_mark_point.png',
    technologyPlatform: 'jishupintai_mari_point.png',
    incubator: 'fuhuaqi_mark_point.png',
    incubationPark: 'fuhuayuan_mark_point.png',
  };*/
  enterpriseMarks = {
    home: '#507379',
    technology: '#4fd0f7',
    doubleVenture: '#d35227',
    seedEnterprise: '#1c8366',
    gazelleEnterprise: '#749e2f',
    unicornEnterprise: '#a28636',
    intermediary: '#1d8b9a',
    technologyPlatform: '#cc782d',
    incubator: '#46428e',
    incubationPark: 'fuhuayuan_mark_point.png',
  };
  getEnterpriseMarks () {
    return this.enterpriseMarks;
  }
  httpRequest (url, type, findParams?, pathParams?) {
    let requestUrl = this[url];
    const requestType = type ? type : 'get';
    let requestParams = ``;
    if (!pathParams) {
      for (const item in findParams) {
        if (findParams[item]) {
          requestParams += `${item}=${findParams[item]}&`
        }
      }
    } else {
      requestUrl += findParams;
    }
    const params = new HttpParams({ fromString: requestParams });
    return this.http[requestType](requestUrl, {params});
  }
}
