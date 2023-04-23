import { useRouter } from 'next/router'
import NavBar from "@/components/NavBar"
import { Stock, StockPeriod, RollingMean, Bollinger, StockDayAvg } from "../../constants/types"
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LineElement, LineController, PointElement } from 'chart.js/auto'
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';

export async function getStaticProps(context:any) {
    const { id } = context.params;
    const request = await fetch(`http://localhost:8080/stocks/${id}`);
    const stock : Stock = await request.json();

    return {
        props: {
            stock
        }
    };
}

export async function getStaticPaths() {
    const request = await fetch(`http://localhost:8080/stocks`);
    const allStocks = await request.json();

    const paths = allStocks.map((stock: Stock) => ({
        params: { id: stock.symbol}
    }));

    return {
        paths,
        fallback: false
    }
}

interface StockProps {
    stock: Stock
}

const Stock = ({
    stock
}: StockProps) => {
    const router = useRouter();

    if(!stock) {
        return <div>The requested stock was not found.</div>
    }

    const [strategy, setStrategy] = useState<number>(0);
    const changeStrat = (event: SelectChangeEvent) => {
        setStrategy(+(event.target.value));
    }

    const renderStrategy = (param: number) => {
        switch(param) {
            case 1:
                return (<MeanRegression thisStock={stock}/>)
            default:
                return (<p>No Strategy Selected</p>)
        }
    }

    return (
    <div>
        <NavBar />
            <h1>Information About "{stock.symbol}"</h1>
            <table border={1} cellSpacing={3}>
                <tbody>
                    <tr>
                        <th>Symbol</th>
                        <th>Security</th>
                        <th>GICS Sector</th>
                        <th>GICS Sub Industry</th>
                        <th>HQ Location</th>
                        <th>Date Added</th>
                        <th>CIK</th>
                        <th>Year Founded</th>
                    </tr>
                    <tr>
                        <td>{stock.symbol}</td>
                        <td>{stock.security}</td>
                        <td>{stock.gics_sector}</td>
                        <td>{stock.gics_sub_industry}</td>
                        <td>{stock.headquarters_location}</td>
                        <td>{stock.date_first_added}</td>
                        <td>{stock.cik}</td>
                        <td>{stock.founded}</td>
                    </tr>
                </tbody>
            </table>

        <Select labelId="strategy-selector-label" id="strategy-selector" value={strategy.toString()} label="Strategy" onChange={changeStrat}>
            <MenuItem value={0}>Select Strategy...</MenuItem>
            <MenuItem value={1}>Mean Regression</MenuItem>
            <MenuItem value={2}>Other Selection</MenuItem>
        </Select>

        {renderStrategy(strategy)}
        

    </div>
    )
}

function formatDates(data : StockDayAvg) {
    const toDate = new Date(data.date);
    const formatted = toDate.toISOString().slice(0, 10);
    return {...data, date: formatted};
}

export function MeanRegression({thisStock}:{thisStock:Stock}) {
    // const minDate = dayjs("2020-10-01"); 
    const minDate = dayjs("2020-10-20");
    const maxDate = dayjs("2022-07-29");

    const [endDate, setEndDate] = useState<Date>(maxDate);

    const [graphData, setGraphData] = useState<StockDayAvg[] | null>(null);
    const [rollingMean, setRollingMean] = useState<RollingMean[] | null>(null);
    const [upperBollinger, setUpperBollinger] = useState<Bollinger[] | null>(null);
    const [lowerBollinger, setLowerBollinger] = useState<Bollinger[] | null>(null);

    const queryRange = async () => {
        const endDateVal = endDate.toJSON().substring(0, 10);
        // const period = dayjs(endDateVal).diff("2020-10-01", 'day');

        const req = await fetch(`http://localhost:8080/stockAvgRange/${thisStock.symbol}?end=${endDateVal}`);
        const close : StockDayAvg[] = await req.json();
        const closeData : StockDayAvg[] = close.map((c : StockDayAvg) => formatDates(c));
        setGraphData(closeData);

        const req_rolling = await fetch(`http://localhost:8080/rollingMean/${thisStock.symbol}?end=${endDateVal}&period=20`);
        const rollingData : RollingMean[] = await req_rolling.json();
        setRollingMean(rollingData);

        const req_upper = await fetch(`http://localhost:8080/bollinger/${thisStock.symbol}?end=${endDateVal}&period=20&side=0`);
        const upperData : Bollinger[] = await req_upper.json();
        setUpperBollinger(upperData);

        const req_lower = await fetch(`http://localhost:8080/bollinger/${thisStock.symbol}?end=${endDateVal}&period=20&side=1`);
        const lowerData : Bollinger[] = await req_lower.json();
        setLowerBollinger(lowerData);
    }

    Chart.register(CategoryScale, LineElement, LineController, PointElement);
    const toGraph = {
        labels: graphData?.map((d : StockDayAvg) => d.date),
        datasets: [{
            label: 'Close',
            fill: false,
            lineTension: 0.1,
            backgroundColor: 'rgba(0,125,255,0.4)',
            borderColor: 'rgba(0,125,255,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(0,125,255,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(0,125,255,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: graphData?.map((d : StockDayAvg) => d.close)
        }, {
            label: '20 ma',
            fill: false,
            lineTension: 0.1,
            backgroundColor: 'rgba(255,171,0,0.4)',
            borderColor: 'rgba(255,171,0,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(255,171,0,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(225,171,0,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: rollingMean?.map((rolling : RollingMean) => rolling.rolling_mean)
        }, {
            label: 'Upper Bollinger',
            fill: false,
            lineTension: 0.1,
            backgroundColor: 'rgba(140,140,140,0.4)',
            borderColor: 'rgba(140,140,140,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(140,140,140,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(140,140,140,0,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: upperBollinger?.map((b : Bollinger) => b.bollinger)
        }, {
            label: 'Lower Bollinger',
            fill: {target: '-1', above: 'rgba(140,140,140,0.2)'},
            lineTension: 0.1,
            backgroundColor: 'rgba(140,140,140,0.4)',
            borderColor: 'rgba(140,140,140,1)',
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: 'rgba(140,140,140,1)',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(140,140,140,1)',
            pointHoverBorderColor: 'rgba(220,220,220,1)',
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: lowerBollinger?.map((b : Bollinger) => b.bollinger)
        }
        ]
    };

    return (
        // <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div>
            <div> </div>
            <div>
                <DatePicker label="End Date" minDate={minDate} maxDate={maxDate} value={endDate} onChange={(newValue) => setEndDate(newValue)}/>
                <button onClick={queryRange}>Generate Graph</button>
            </div>
            {graphData &&
            <div>
                <Line width={100} height={50} data={toGraph} />
            </div>}
        </div>
        // </LocalizationProvider>
        
    )
}




export default Stock;