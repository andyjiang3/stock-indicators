import { useRouter } from 'next/router'
import NavBar from "@/components/NavBar"
import styles from '../../styles/Home.module.css'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';



interface AvgPriceData {
    adjustedClose: number,
    cik: number,
    close: number,
    date: Date,
    date_first_added: string,
    day_avg: number,
    founded: string,
    gics_sector: string,
    gics_sub_industry: string,
    headquarters_location: string,
    high: number,
    low: number,
    open: number,
    security: string,
    symbol: string,
    volume: number
}

export function DateRangeSelector({thisStock}:{thisStock:Stock}) {
    const minDate = dayjs('2020-10-01');
    const maxDate = dayjs('2022-07-22');

    const [startDate, setStartDate] = useState<Date>(minDate);
    const [endDate, setEndDate] = useState<Date>(maxDate);

    

    const printDates = () => {
        console.log("start date: " + startDate?.toJSON().substring(0, 10));
        console.log("end date: " + endDate?.toJSON().substring(0, 10));
    }

    const [graphData, setGraphData] = useState<AvgPriceData[] | null>(null);

    const queryRange = async () => {
        const req = await fetch(`http://localhost:8080/stockAvgRange/${thisStock.symbol}?start=${startDate?.toJSON().substring(0, 10)}&end=${endDate?.toJSON().substring(0, 10)}`);
        const avgPrice : AvgPriceData[] = await req.json();
        setGraphData(avgPrice);
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <h1>Average Price in Time Range</h1>
            <div>
                <DatePicker label="Start Date" minDate={minDate} maxDate={endDate} value={startDate} onChange={(newValue) => setStartDate(newValue)}/>
                <DatePicker label="End Date" minDate={startDate} maxDate={maxDate} value={endDate} onChange={(newValue) => setEndDate(newValue)}/>
                <button onClick={queryRange}>Generate Graph</button>
            </div>
            {graphData? 
                // <div>{graphData.map((datapoint : AvgPriceData) => (
                //     <div key={datapoint.date.toString()}>
                //         <p>{datapoint.date.toString()} avg price: {datapoint.day_avg}</p>
                //     </div>
                // ))}</div>
                <ResponsiveContainer width={"100%"} height={300}>
                    <LineChart width={500}
                        height={300}
                        data={graphData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="day_avg" stroke="#8884d8" dot={false}/>
                    </LineChart>
                </ResponsiveContainer>
            : <p>Graph not generated yet</p>}
        </LocalizationProvider>
        
    )
}

export default function Stock({thisStock}:{thisStock:Stock}) {

    const router = useRouter();

    if(!thisStock) {
        return <div>The requested stock was not found.</div>
    }

    return (
    <div className={styles.container}>
        <NavBar />
            <h1>{thisStock.symbol}</h1>
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
                        <td>{thisStock.symbol}</td>
                        <td>{thisStock.security}</td>
                        <td>{thisStock.gics_sector}</td>
                        <td>{thisStock.gics_sub_industry}</td>
                        <td>{thisStock.headquarters_location}</td>
                        <td>{thisStock.date_first_added}</td>
                        <td>{thisStock.cik}</td>
                        <td>{thisStock.founded}</td>
                    </tr>
                </tbody>
            </table>
        <div className={styles.divSpacing}>
            <DateRangeSelector thisStock={thisStock}/>
        </div>
        
    </div>
    )
}


interface Stock {
    symbol: string,
    security: string,
    gics_sector: string,
    gics_sub_industry: string,
    headquarters_location: string,
    date_first_added: string,
    cik: number,
    founded: number
}

interface Props {
    thisStock: Stock
}

export async function getStaticProps(context:any) {
    const { id } = context.params;
    const request = await fetch(`http://localhost:8080/stocks/${id}`);
    const thisStock : Stock = await request.json();
    return {
        props: {
            thisStock
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