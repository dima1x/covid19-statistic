import axios from 'axios';
import * as Calculator from './Calculator';

export type RecordData = {
  API: RecordAPIData;
  short: ShortRecord[];
  records: Record[];
  date: DateInfo;
  countries: string[];
  chart: ChartRecord[];
}

export type Record = {
  country: string;
  casesCount: number;
  deathsCount: number;
  allCasesCount: number;
  allDeathsCount: number;
  casesCountPer1000: number;
  deathsCountPer1000: number;
  averageCasesCountPerDay: number;
  averageDeathsCountPerDay: number;
  maxCasesCount: number;
  maxDeathsCount: number;
  recordCount: number;
}

export type ChartRecord = [Date, number, number]

export type RecordAPIData = {
  records: RecordAPI[];
  countris: string[];
}

export type RecordAPI = {
  dateRep: string;
  day: string;
  month: string;
  year: string;
  cases: number;
  deaths: number;
  countriesAndTerritories: string;
  geoId: string;
  countryterritoryCode: string;
  popData2019: number;
  continentExp: string;
  "Cumulative_number_for_14_days_of_COVID-19_cases_per_100000": string;
}

export type ShortRecord = {
  country: string;
  allIncidentsCount: number;
  allDeathsCount: number;
}

export type DateInfo = {
  min: Date;
  max: Date;
}

export async function GetStatistic(): Promise<RecordAPIData> {
  let result = await axios.get("https://opendata.ecdc.europa.eu/covid19/casedistribution/json/");

  let api: RecordAPIData = {
    records: [],
    countris: []
  };

  api.records = result.data.records as RecordAPI[];

  for (let i = 0; i < api.records.length; i++) {
    api.records[i].countriesAndTerritories = api.records[i].countriesAndTerritories.replaceAll('_', ' ');

    if (!api.countris.find(x => x === api.records[i].countriesAndTerritories)) api.countris.push(api.records[i].countriesAndTerritories);
  }

  return api;
}

export function GetMinMaxDate(recordsAPI: RecordAPI[]): DateInfo {
  let dateInfo = {
    min: { year: Number(recordsAPI[0].year), month: Number(recordsAPI[0].month), day: Number(recordsAPI[0].day) },
    max: { year: Number(recordsAPI[0].year), month: Number(recordsAPI[0].month), day: Number(recordsAPI[0].day) }
  }

  for (let i = 1; i < recordsAPI.length; i++) {
    if (Calculator.DateToNumber(Number(recordsAPI[i].year), Number(recordsAPI[i].month), Number(recordsAPI[i].day)) <= Calculator.DateToNumber(dateInfo.min.year, dateInfo.min.month, dateInfo.min.day))
      dateInfo.min = {year: Number(recordsAPI[i].year), month: Number(recordsAPI[i].month), day: Number(recordsAPI[i].day)}

    if (Calculator.DateToNumber(Number(recordsAPI[i].year), Number(recordsAPI[i].month), Number(recordsAPI[i].day)) >= Calculator.DateToNumber(dateInfo.max.year, dateInfo.max.month, dateInfo.max.day))
      dateInfo.max = {year: Number(recordsAPI[i].year), month: Number(recordsAPI[i].month), day: Number(recordsAPI[i].day)}
  }

  let result: DateInfo = {
    min: new Date(dateInfo.min.year, dateInfo.min.month - 1, dateInfo.min.day),
    max: new Date(dateInfo.max.year, dateInfo.max.month - 1, dateInfo.max.day)
  }

  return result;
}

export function GetJustData(recordsAPI: RecordAPI[]): ShortRecord[] {
  let shortRecords: ShortRecord[] = [];
  
  for (let i = 0; i < recordsAPI.length; i++) {
    let recordIndex = shortRecords.findIndex(x => x.country === recordsAPI[i].countriesAndTerritories);

    if (recordIndex < 0)
      shortRecords.push({
        country: recordsAPI[i].countriesAndTerritories,
        allIncidentsCount: recordsAPI[i].cases,
        allDeathsCount: recordsAPI[i].deaths
      });
    else {
      shortRecords[recordIndex].allIncidentsCount += recordsAPI[i].cases;
      shortRecords[recordIndex].allDeathsCount += recordsAPI[i].deaths;
    }
  }

  return shortRecords;
}

export function BuildRecords(recordsAPI: RecordAPI[], shortRecords: ShortRecord[], dateInfo: DateInfo): Record[] {
  let records: Record[] = [];

  for (let i = 0; i < recordsAPI.length; i++) {
    if (dateInfo.min <= new Date(Number(recordsAPI[i].year), Number(recordsAPI[i].month) - 1, Number(recordsAPI[i].day)) &&
        dateInfo.max >= new Date(Number(recordsAPI[i].year), Number(recordsAPI[i].month) - 1, Number(recordsAPI[i].day))) {
          let recordIndex = records.findIndex(x => x.country === recordsAPI[i].countriesAndTerritories);

          if (recordIndex < 0)
            records.push({
              country: recordsAPI[i].countriesAndTerritories,
              casesCount: recordsAPI[i].cases,
              deathsCount: recordsAPI[i].deaths,
              allCasesCount: Number(shortRecords.find(x => x.country === recordsAPI[i].countriesAndTerritories)?.allIncidentsCount),
              allDeathsCount: Number(shortRecords.find(x => x.country === recordsAPI[i].countriesAndTerritories)?.allDeathsCount),
              casesCountPer1000: recordsAPI[i].popData2019 != null ? Number((recordsAPI[i].cases / (recordsAPI[i].popData2019 / 1000)).toFixed(2)) : 0,
              deathsCountPer1000: recordsAPI[i].popData2019 != null ? Number((recordsAPI[i].deaths / (recordsAPI[i].popData2019 / 1000)).toFixed(2)) : 0,
              averageCasesCountPerDay: recordsAPI[i].cases,
              averageDeathsCountPerDay: recordsAPI[i].deaths,
              maxCasesCount: recordsAPI[i].cases,
              maxDeathsCount: recordsAPI[i].deaths,
              recordCount: 1
            });
          else {
            records[recordIndex].recordCount++;

            records[recordIndex].casesCount += recordsAPI[i].cases;
            records[recordIndex].deathsCount += recordsAPI[i].deaths;

            records[recordIndex].casesCountPer1000 = recordsAPI[i].popData2019 != null ? Number((records[recordIndex].casesCount / (recordsAPI[i].popData2019 / 1000)).toFixed(4)) : 0;
            records[recordIndex].deathsCountPer1000 = recordsAPI[i].popData2019 != null ? Number((records[recordIndex].deathsCount / (recordsAPI[i].popData2019 / 1000)).toFixed(4)) : 0;

            records[recordIndex].averageCasesCountPerDay = Number((records[recordIndex].casesCount / records[recordIndex].recordCount).toFixed(2));
            records[recordIndex].averageDeathsCountPerDay = Number((records[recordIndex].deathsCount / records[recordIndex].recordCount).toFixed(2));

            if (recordsAPI[i].cases > records[recordIndex].maxCasesCount) records[recordIndex].maxCasesCount = recordsAPI[i].cases;
            if (recordsAPI[i].deaths > records[recordIndex].maxDeathsCount) records[recordIndex].maxDeathsCount = recordsAPI[i].deaths;
          }
        }
  }

  console.log(records[0].recordCount);

  return records;
}

export function BuildChartRecords(recordsAPI: RecordAPI[], dateInfo: DateInfo, country: string): ChartRecord[] {
  let result: ChartRecord[] = [];

  if (country === "all") {
    for (let i = 0; i < recordsAPI.length; i++) {
      let date = new Date(Number(recordsAPI[i].year), Number(recordsAPI[i].month) - 1, Number(recordsAPI[i].day));
      if (date >= dateInfo.min && date <= dateInfo.max) {
        let recordIndex = result.findIndex(x => x[0].getFullYear() === date.getFullYear() && x[0].getMonth() === date.getMonth() && x[0].getDay() === date.getDay());
        if (recordIndex >= 0) {
          result[recordIndex][1] += recordsAPI[i].cases;
          result[recordIndex][2] += recordsAPI[i].deaths;
        }
        else {
          result.push([date, recordsAPI[i].cases, recordsAPI[i].deaths]);
        }
      }
    }
  } else {
    for (let i = 0; i < recordsAPI.length; i++) {
      if (recordsAPI[i].countriesAndTerritories !== country) continue;

      let date = new Date(Number(recordsAPI[i].year), Number(recordsAPI[i].month) - 1, Number(recordsAPI[i].day));
      if (date >= dateInfo.min && date <= dateInfo.max) result.push([date, recordsAPI[i].cases, recordsAPI[i].deaths]);
    }
  }

  return result;
}