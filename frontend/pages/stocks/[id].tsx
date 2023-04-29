import { useRouter } from 'next/router'
import NavBar from "@/components/NavBar"
import { Stock, StockPeriod, RollingMean, Bollinger, StockDayAvg } from "../../constants/types"
import { DatePicker } from '@mui/x-date-pickers';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LineElement, LineController, PointElement } from 'chart.js/auto'
import { MenuItem, Select, SelectChangeEvent, CircularProgress} from '@mui/material';

interface StockProps {
    startDate: string,
    setStartDate: Dispatch<SetStateAction<string>>,
    endDate: string,
    setEndDate: Dispatch<SetStateAction<string>>
}
const Stock = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: StockProps) => {
    const router = useRouter();
    const [strategy, setStrategy] = useState<number>(0);
    const [stockInfo, setStockInfo] = useState<Stock | null>(null);
    const [newsData, setNewsData] = useState(null);

    const [priceData, setPriceData] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [period, setPeriod] = useState(20);
    const [isCalcStrat, setIsCalcStrat] = useState(false);
    

    const stock = router.query.id;
    const maxDate = "2022-07-29";

    useEffect(() => {
        if (stock) {
            fetch(`http://localhost:8080/stocks/${stock}`).then((res) => 
                res.json().then((resJson: Stock) => {
                    setStockInfo(resJson);
                })
            );

            fetch(`http://localhost:8080/stockAvgRange/${stock}?start=${startDate}&end=${endDate}`).then((res) => 
                res.json().then((resJson) => {
                    const formattedData = resJson.map((c : StockDayAvg) => formatDates(c));
                    setPriceData(formattedData);
                })
            );  

            fetch(`http://localhost:8080/news/${stock}?start=${startDate}&end=${endDate}`).then((res) => 
                res.json().then((resJson) => {
                    const formattedData = resJson.map((c: any) => formatDates(c));
                    setNewsData(formattedData);
                })
            );  
        } 
    }, [stock])

    useEffect(() => {
        // generate initial price graph
        if (stock && priceData) {
            calcPriceGraph()
        }
    }, [priceData])

    if (!stock) {
        return <div>The requested stock was not found.</div>
    }

    const changeStrat = (event: SelectChangeEvent) => {
        setStrategy(parseInt(event.target.value));
    }

    const calcPriceGraph = () => {
        const newGraphData: any = {
            labels: null,
            datasets: []
        }
        const graphPriceData = {
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
            data: (priceData as any).map((d : any) => d.close)
        }
        newGraphData['labels'] = (priceData as any).map((d: any) => d.date);
        newGraphData['datasets'].push(graphPriceData);

        setGraphData(newGraphData);
    }

    const calcMeanReversionGraph = async () => {
        if (!graphData || !priceData) {
            return;
        }

        const rollingMean = await fetch(`http://localhost:8080/rollingMean/${stock}?start=${startDate}&end=${endDate}&period=${period}`).then((res) => 
            res.json().then((resJson) => {
                return resJson
            })
        );  

        const upperBollinger = await fetch(`http://localhost:8080/bollinger/${stock}?start=${startDate}&end=${endDate}&period=${period}&side=0`).then((res) => 
            res.json().then((resJson) => {
                return resJson
            })
        ); 

        const lowerBollinger = await fetch(`http://localhost:8080/bollinger/${stock}?start=${startDate}&end=${endDate}&period=${period}&side=1`).then((res) => 
            res.json().then((resJson) => {
                return resJson
            })
        );

        console.log("upper");
        console.log(upperBollinger);
        console.log("mean");
        console.log(rollingMean);

        const rollingMeanData = {
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
            data: (rollingMean as any).map((rolling : RollingMean) => rolling.rolling_mean)
        }

        const upperBollingerData = {
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
            data: (upperBollinger as any).map((b : Bollinger) => b.bollinger)
        }

        const lowerBollingerData = {
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
            data: (lowerBollinger as any).map((b : Bollinger) => b.bollinger)
        }

        const newGraphData: any = {
            labels: null,
            datasets: []
        }
        const graphPriceData = {
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
            data: (priceData as any).map((d : any) => d.close)
        }
        newGraphData['labels'] = (priceData as any).map((d: any) => d.date);
        newGraphData['datasets'].push(graphPriceData);
        (newGraphData['datasets'] as any).push(rollingMeanData);
        (newGraphData['datasets'] as any).push(upperBollingerData);
        (newGraphData['datasets'] as any).push(lowerBollingerData);
        setGraphData(newGraphData);
        console.log(newGraphData);
    }

    const calcStrategy = (strategyNumber: number):void => {
        setIsCalcStrat(true);
        switch (strategyNumber) {
            case 0:
                calcPriceGraph();
                break;
            case 1:
                calcMeanReversionGraph();
                break;
        }
        setIsCalcStrat(false);
    }
    
    const renderTradingOptions = (strategyNumber: number) => {
        switch (strategyNumber) {
            case 0:
                return <div className="mb-5">No strategy selected</div>
            case 1:
                return <>
                    <h1 className="text-l font-medium mb-2">How it works</h1>
                    <div className="mb-5">Mean-reversion strategies work on the assumption that there is an underlying stable trend in the price of an asset and prices fluctuate randomly around this trend . Therefore, values deviating far from the trend will tend to reverse direction and revert back to the trend.</div>
                    <h1 className="text-l mt-5 font-medium mb-2">Options</h1>
                    <div className="mb-3">
                        <h1 className="inline-block text-l mt-5 font-small mb-2 mr-5">Period</h1>
                        <input className="inline-block p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Period Number" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPeriod(parseInt(event.target.value))} defaultValue={period}></input>
                    </div>
                    <p className="text-zinc-600 mb-10">This specifies a window of days to extract data from for each date. Higher period would therefore lead to more generalized aggregations.</p>
                </>
                
        }
    }

    Chart.register(CategoryScale, LineElement, LineController, PointElement);

    return (
        <div>
            <NavBar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
            {!stockInfo || !priceData || !graphData || !newsData ? 
            <div className="flex justify-center">
                <CircularProgress/>
            </div> 
            :
            <div className="p-10 pt-5">
                <div className="flex justify-start items-baseline flex-col mb-5">
                    <h1 className="text-4xl bold">{stockInfo.symbol}</h1>
                    <h2 className="text-xl text-zinc-800">{stockInfo.security}</h2>
                </div>

                <div className="grid grid-cols-7 gap-4 h-28 mb-8">
                    {Object.keys(stockInfo).map((data, i) => {
                        if (i != 0) {
                            return (<div className="flex-row bg-white h-full w-full border border-gray-300 justify-center text-center p-1 pt-2 rounded-md">
                                <div className="text-sm font-bold mb-3">{data.replaceAll("_", " ").split(" ").map((word) => word[0].toUpperCase() + word.substring(1)).join(" ")}</div>
                                <div className="">{(stockInfo as any)[data]}</div>
                            </div>)
                        }
                    })}
                </div>
                
                <div className="flex">
                    <div className="w-2/3 flex-row m-0 justify-start">
                        <h1 className="text-xl mt-5 font-small">Stock Price</h1>
                        <Line className="flex m-0" width={100} height={50} data={graphData} />
                    </div>
                    <div className="w-1/3 flex-row m-0 justify-start pl-10">
                        <h1 className="text-xl mt-5 font-small mb-7">Trading Strategy</h1>
                        {
                            isCalcStrat ? <CircularProgress/> 
                            :
                            <>
                             <div>
                                <Select className="mb-5" labelId="strategy-selector-label" id="strategy-selector" value={strategy.toString()} label="Strategy" onChange={changeStrat}>
                                    <MenuItem value={0}>No Strategy</MenuItem>
                                    <MenuItem value={1}>Mean Reversion</MenuItem>
                                </Select>
                            </div>
                            {renderTradingOptions(strategy)}
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => calcStrategy(strategy)}>Generate</button>
                            </>
                        }
                     </div>
                </div>
                <h1 className="text-xl mt-5 mb-3 font-small">News Data</h1>
                <p className="text-zinc-600 mb-10">News data for {stock} starting from {startDate} to 25 earliest days represented in volume</p>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {Object.keys(newsData[0]).map((key, i) => {
                                    console.log(key)
                                    if (i < 11 && key != "symbol") {
                                        return (<th scope="col" className="px-6 py-3">
                                        {key.replace("_", " ")}
                                         </th>)
                                    }
                                    
                                })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {(newsData as any).map((data: any, j: any) => {
                                if (j < 25) {
                                    return (<tr className="bg-white border-b">
                                        {Object.keys(newsData[0]).map((key, i) => {
                                            if (i < 11 && key != "symbol") {
                                                return (
                                                    <td className="px-6 py-4">
                                                        {(data as any)[key]}
                                                    </td> 
                                                )
                                            }
                                        
                                        })
                                        }
                                    </tr>)
                                }
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            }
        </div>
    )
}

function formatDates(data : StockDayAvg) {
    const toDate = new Date(data.date);
    const formatted = toDate.toISOString().slice(0, 10);
    return {...data, date: formatted};
}


export default Stock;