import { useState } from 'react';
import * as Covid19Statistic from './modules/Covid19Statistic';
import * as Calculator from './modules/Calculator';
import type { RecordData, Record, ChartRecord } from './modules/Covid19Statistic';

// Components
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import DatePicker from 'react-date-picker';

// Tabs
import TableTab from './tabs/TableTab';
import ChartTab from './tabs/ChartTab';

// Styles
import './styles/base.css';
import './styles/tabs.css';

import './styles/table.css';
import "./styles/chart.css";


import './styles/date/datePicker.css';
import './styles/date/calendar.css';

let recordData: RecordData = {
  API: await Covid19Statistic.GetStatistic(),
  short: [],
  records: [],
  date: {min: new Date(), max: new Date()},
  countries: [],
  chart: []
}

recordData.short = Covid19Statistic.GetJustData(recordData.API.records);
recordData.date = Covid19Statistic.GetMinMaxDate(recordData.API.records);
recordData.records = Covid19Statistic.BuildRecords(recordData.API.records, recordData.short, recordData.date);
recordData.chart = Covid19Statistic.BuildChartRecords(recordData.API.records, recordData.date, "all");

// App Script
function App() {
  const [minDate, setMinDate] = useState<Date>(recordData.date.min);
  const [maxDate, setMaxDate] = useState<Date>(recordData.date.max);
  const [records, setRecords] = useState<Record[]>(recordData.records);
  const [chartRecords, setChartRecords] = useState<ChartRecord[]>(recordData.chart);
  const [chartCountry, setChartCountry] = useState<string>("all");

  function resetDate() {
    setMinDate(recordData.date.min);
    setMaxDate(recordData.date.max);

    setRecords(Covid19Statistic.BuildRecords(recordData.API.records, recordData.short, {min: recordData.date.min, max: recordData.date.max }));
    setChartRecords(Covid19Statistic.BuildChartRecords(recordData.API.records, {min: recordData.date.min, max: recordData.date.max }, chartCountry));
  }

  function changeDate(min: Date, max: Date) {
    setMinDate(min);
    setMaxDate(max);

    setRecords(Covid19Statistic.BuildRecords(recordData.API.records, recordData.short, {min: min, max: max }));
    setChartRecords(Covid19Statistic.BuildChartRecords(recordData.API.records, {min: min, max: max }, chartCountry));
  }

  function updateChartRecords(country: string) {
    setChartCountry(country);
    setChartRecords(Covid19Statistic.BuildChartRecords(recordData.API.records, {min: minDate, max: maxDate }, country));
  }

  return (
    <div>
      <div className="date">
        <p>Период от&nbsp;</p>
        <DatePicker clearIcon="" calendarIcon="" format="y/MM/dd" minDate={recordData.date.min} maxDate={maxDate} onChange={value => changeDate(value as Date, maxDate)} value={minDate}></DatePicker>
        <p>&nbsp;до&nbsp;</p>
        <DatePicker clearIcon="" calendarIcon="" format="y/MM/dd" minDate={minDate} maxDate={recordData.date.max} onChange={value => changeDate(minDate, value as Date)} value={maxDate}></DatePicker>
        {Calculator.DateToNumber(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) === Calculator.DateToNumber(recordData.date.min.getFullYear(), recordData.date.min.getMonth(), recordData.date.min.getDate()) &&
         Calculator.DateToNumber(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) === Calculator.DateToNumber(recordData.date.max.getFullYear(), recordData.date.max.getMonth(), recordData.date.max.getDate()) ? null : <button className="showAll" onClick={x => resetDate()}>Отобразить все данные</button>}
      </div>
      <Tabs>
        <TabList className="tab-list">
          <Tab className="tab" selectedClassName="tab--selected">Таблица</Tab>
          <Tab className="tab tab--hide-left-border" selectedClassName="tab--selected">График</Tab>
        </TabList>
        <TabPanel className="tab-panel" selectedClassName="tab-panel--selected">
          <div className="default tableTab">
            <TableTab records={records} setRecords={setRecords} />
          </div>
        </TabPanel>
        <TabPanel className="tab-panel" selectedClassName="tab-panel--selected">
          <div className="default chartTab">
            <ChartTab records={chartRecords} updateRecords={updateChartRecords} country={chartCountry} setCountry={setChartCountry} countries={recordData.API.countris} />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
