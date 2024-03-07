import { Chart } from "react-google-charts";
import { ChartRecord } from "../modules/Covid19Statistic";

const data = ["Период", "Заболевания", "Смерти"];

const options = {
	colors: ['#AAff00', '#ff0000'],
	hAxis: { title: "Период", titleTextStyle: { fontName: "Arial", bold: true }, textPosition: "none", gridlines: {color: "transparent"} },
	vAxis: { title: "Случаи", titleTextStyle: { fontName: "Arial", bold: true }, textPosition: "none", gridlines: {color: "transparent"} },
	chartArea: { width: '50%' },
};

function ChartTab(props: {records: ChartRecord[], updateRecords: any, country: string, setCountry: any, countries: string[]}) {
	return (
		<>
			<div className="filters">
				<p>Страна</p>
				<select value={props.country} onChange={x => props.updateRecords(x.target.value)}>
					<option value="all">Все страны</option>
					{props.countries.map((value, index) => {
						return <option key={"country_" + index} value={value}>{value}</option>
					})}
              	</select>
			</div>
			<Chart
				chartType="AreaChart"
				width="100%"
				height="400px"
				data={[data, ...props.records]}
				options={options}
			/>
		</>
	);
}

export default ChartTab;