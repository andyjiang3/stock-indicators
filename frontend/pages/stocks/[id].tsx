import { useRouter } from 'next/router'
import NavBar from "@/components/NavBar"
import { Stock, StockPeriod, RollingMean, Bollinger, StockDayAvg } from "../../constants/types"
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Line, Chart } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LineElement, LineController, PointElement } from 'chart.js/auto'
import { MenuItem, Select, SelectChangeEvent, CircularProgress} from '@mui/material';
import { format } from 'path';

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
    const [isCalcStrat, setIsCalcStrat] = useState(false);
    const [buySellGraphData, setBuySellGraphData] = useState(null);

    //options
    const [period, setPeriod] = useState(20); // all trading strategies
    const [meanMultipler, setMeanMultipler] = useState(0); // mean reversion
    const [averagingMethod, setAveragingMethod] = useState<number>(0); // momentum
    const [expSmoothing, setExpSmoothing] = useState<number>(2) // momentum
    const [newsMultiplier, setNewsMultiplier] = useState<number>(0.5) // news analysis

    const [newsShowMore, setNewsShowMore] = useState(false) // Show all news data

    const [noData, setNoData] = useState(false);

    const stock = router.query.id;

    useEffect(() => {
        if (stock) {
            fetch(`http://localhost:8080/stocks/${stock}`).then((res) => 
                res.json().then((resJson: Stock) => {
                    setStockInfo(resJson);
                })
            );

            fetch(`http://localhost:8080/stockAvgRange/${stock}?start=${startDate}&end=${endDate}`).then((res) => 
                res.json().then((resJson) => {
                    if (!resJson || resJson.length == 0) {
                        setNoData(true);
                    }
                    const formattedData = resJson.map((c : any) => formatDates(c));
                    setPriceData(formattedData);
                })
            );  

            fetch(`http://localhost:8080/news/${stock}?start=${startDate}&end=${endDate}`).then((res) => 
                res.json().then((resJson) => {
                    if (resJson.length == 0) {
                        return <div>The requested stock does not have data for the given range.</div>
                    }
                    console.log(resJson);
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
        setBuySellGraphData(null);
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

        const upperBollinger = await fetch(`http://localhost:8080/bollinger/${stock}?start=${startDate}&end=${endDate}&period=${period}&side=0&multiplier=${1 - meanMultipler}`).then((res) => 
            res.json().then((resJson) => {
                return resJson
            })
        ); 

        const lowerBollinger = await fetch(`http://localhost:8080/bollinger/${stock}?start=${startDate}&end=${endDate}&period=${period}&side=1&multiplier=${1 + meanMultipler}`).then((res) => 
            res.json().then((resJson) => {
                return resJson
            })
        );

        const newGraphData: any = {
            labels: null,
            datasets: []
        }

        const newBuySellGraphData: any = {
            labels: null,
            datasets: []
        }

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
            data: (priceData as any).map((d : any) => {
                return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
            })
        }

        const sellSignals = {
            label: 'Sell',
            fill: false,
            borderColor: "#ffffff",
            backgroundColor: "#ffffff",
            pointBorderColor: "#9c222c",
            pointBackgroundColor: "#c23642",
            pointHoverBackgroundColor: "#D4AC0D",
            pointHoverBorderColor: "black",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 5,
            pointHitRadius: 10,
            data: (lowerBollinger as any).filter((d: any) => d.sell).map((d : any) => {
                if (d.sell) {
                    return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
                }
            })
        }

        const buySignals = {
            label: 'Buy',
            fill: false,
            borderColor: "#ffffff",
            backgroundColor: "#ffffff",
            pointBorderColor: "#1a7034",
            pointBackgroundColor: "#229c47",
            pointHoverBackgroundColor: "#D4AC0D",
            pointHoverBorderColor: "black",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 5,
            pointHitRadius: 10,
            data: (upperBollinger as any).filter((d: any) => d.buy).map((d : any) => {
                if (d.buy) {
                    return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
                }
            })
        }

        newGraphData['labels'] = (priceData as any).map((d: any) => d.date);
        newGraphData['datasets'].push(graphPriceData);
        (newGraphData['datasets'] as any).push(rollingMeanData);
        (newGraphData['datasets'] as any).push(upperBollingerData);
        (newGraphData['datasets'] as any).push(lowerBollingerData);
        setGraphData(newGraphData);

        newBuySellGraphData['labels'] = (priceData as any).map((d: any) => d.date);
        newBuySellGraphData['datasets'].push(graphPriceData);
        (newBuySellGraphData['datasets'] as any).push(sellSignals);
        (newBuySellGraphData['datasets'] as any).push(buySignals);

        setBuySellGraphData(newBuySellGraphData);
    }

    const calcMomentum = async () => {
        if (!graphData || !priceData) {
            return;
        }

        let meanData;

        switch (averagingMethod) {
            case 0:
                meanData = await fetch(`http://localhost:8080/rollingMean/${stock}?start=${startDate}&end=${endDate}&period=${period}`).then((res) => 
                res.json().then((resJson) => {
                    return resJson
                })
            );  
            break;
            case 1:
                meanData = await fetch(`http://localhost:8080/weightedRollingMean/${stock}?start=${startDate}&end=${endDate}&period=${period}`).then((res) => 
                res.json().then((resJson) => {
                    return resJson
                })
            );  
            break;
            case 2:
                meanData = await fetch(`http://localhost:8080/expRollingMean/${stock}?start=${startDate}&end=${endDate}&period=${period}&smoothing=${expSmoothing}`).then((res) => 
                res.json().then((resJson) => {
                    return resJson
                })
            );  
            break;
        }

        const newGraphData: any = {
            labels: null,
            datasets: []
        }

        const newBuySellGraphData: any = {
            labels: null,
            datasets: []
        }

        const rollingMeanData = {
            label: 'Rolling Mean',
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
            data: (meanData as any).map((d : any) => {
                return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.rolling_mean}
            })
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
            data: (priceData as any).map((d : any) => {
                return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
            })
        }

        const sellSignals = {
            label: 'Sell',
            fill: false,
            borderColor: "#ffffff",
            backgroundColor: "#ffffff",
            pointBorderColor: "#9c222c",
            pointBackgroundColor: "#c23642",
            pointHoverBackgroundColor: "#D4AC0D",
            pointHoverBorderColor: "black",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 5,
            pointHitRadius: 10,
            data: (meanData as any).filter((d: any) => d.sell).map((d : any) => {
                if (d.sell) {
                    return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
                }
            })
        }

        const buySignals = {
            label: 'Buy',
            fill: false,
            borderColor: "#ffffff",
            backgroundColor: "#ffffff",
            pointBorderColor: "#1a7034",
            pointBackgroundColor: "#229c47",
            pointHoverBackgroundColor: "#D4AC0D",
            pointHoverBorderColor: "black",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 5,
            pointHitRadius: 10,
            data: (meanData as any).filter((d: any) => d.buy).map((d : any) => {
                if (d.buy) {
                    return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
                }
            })
        }

        newGraphData['labels'] = (priceData as any).map((d: any) => d.date);
        newGraphData['datasets'].push(graphPriceData);
        (newGraphData['datasets'] as any).push(rollingMeanData);
        setGraphData(newGraphData);

        newBuySellGraphData['labels'] = (priceData as any).map((d: any) => d.date);
        newBuySellGraphData['datasets'].push(graphPriceData);
        (newBuySellGraphData['datasets'] as any).push(sellSignals);
        (newBuySellGraphData['datasets'] as any).push(buySignals);

        setBuySellGraphData(newBuySellGraphData);
    }

    const calcNewsAnalysis = async () => {
        if (!graphData || !priceData) {
            return;
        }

        const newsScore = await fetch(`http://localhost:8080/newsAnalysis/${stock}?start=${startDate}&end=${endDate}&period=${period}&multiplier=${newsMultiplier}`).then((res) => 
            res.json().then((resJson) => {
                return resJson
            })
        );  

        const newGraphData: any = {
            labels: null,
            datasets: []
        }

        const newBuySellGraphData: any = {
            labels: null,
            datasets: []
        }

        const graphNewsScoreData = {
            label: 'News Score',
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
            data: (newsScore as any).map((d : any) => {
                return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.news_score}
            })
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
            data: (newsScore as any).map((d : any) => {
                return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
            })
        }

        const sellSignals = {
            label: 'Sell',
            fill: false,
            borderColor: "#ffffff",
            backgroundColor: "#ffffff",
            pointBorderColor: "#9c222c",
            pointBackgroundColor: "#c23642",
            pointHoverBackgroundColor: "#D4AC0D",
            pointHoverBorderColor: "black",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 5,
            pointHitRadius: 10,
            data: (newsScore as any).filter((d: any) => d.sell).map((d : any) => {
                if (d.sell) {
                    return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
                }
            })
        }

        const buySignals = {
            label: 'Buy',
            fill: false,
            borderColor: "#ffffff",
            backgroundColor: "#ffffff",
            pointBorderColor: "#1a7034",
            pointBackgroundColor: "#229c47",
            pointHoverBackgroundColor: "#D4AC0D",
            pointHoverBorderColor: "black",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 5,
            pointHitRadius: 10,
            data: (newsScore as any).filter((d: any) => d.buy).map((d : any) => {
                if (d.buy) {
                    return {x: (new Date(d.date)).toISOString().slice(0, 10), y: d.close}
                }
            })
        }

        newGraphData['labels'] = (priceData as any).map((d: any) => d.date);
        newGraphData['datasets'].push(graphNewsScoreData);
        setGraphData(newGraphData);

        newBuySellGraphData['labels'] = (priceData as any).map((d: any) => d.date);
        newBuySellGraphData['datasets'].push(graphPriceData);
        (newBuySellGraphData['datasets'] as any).push(sellSignals);
        (newBuySellGraphData['datasets'] as any).push(buySignals);

        setBuySellGraphData(newBuySellGraphData);
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
            case 2:
                calcMomentum();
                break;
            case 3:
                calcNewsAnalysis();
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
                    <div className="mb-2">
                        <h1 className="inline-block text-l mt-5 font-small mb-2 mr-5">Period</h1>
                        <input className="inline-block p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Period Number" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPeriod(parseFloat(event.target.value))} defaultValue={period}></input>
                    </div>
                    <p className="text-zinc-600 mb-3">For each date, this specifies a window of days to extract data from. <u>Higher period would therefore lead to more generalized aggregations.</u></p>

                    <div className="mb-2">
                        <h1 className="inline-block text-l mt-5 font-small mb-2 mr-5">Multiplier Percentage</h1>
                        <input className="inline-block p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Period Number" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMeanMultipler(parseFloat(event.target.value) / 1000)} defaultValue={meanMultipler}></input>
                    </div>
                    <p className="text-zinc-600 mb-10"> Buy (sell) indicators are based on being above (below) the upper (lower) bollinger. <u> This specifies how far above or below the bollinger the price should be before indiciating buy or sell. Higher percentage means more relaxed indicator constraints for buy or sell signals.</u></p>
                </>
            case 2:
                return <>
                    <h1 className="text-l font-medium mb-2">How it works</h1>
                    <div className="mb-5">Momentum trading strategy focuses on buying securities that are rising and sell them when they look to have peaked. The goal is to work with volatility by finding buying opportunities in short-term uptrends and then sell when the securities start to lose momentum</div>
                    <h1 className="text-l mt-5 font-medium mb-2">Options</h1>
                    <div className="mb-2">
                        <h1 className="inline-block text-l mt-5 font-small mb-2 mr-5">Period</h1>
                        <input className="inline-block p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Period Number" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPeriod(parseFloat(event.target.value))} defaultValue={period}></input>
                    </div>
                    <p className="text-zinc-600 mb-3">For each date, this specifies a window of days to extract data from. <u>Higher period would therefore lead to more generalized aggregations.</u></p>

                    <div className="mb-3">
                        <h1 className="inline-block text-l mt-5 font-small mb-2 mr-5">Averaging Method</h1>
                        <Select className="mb-2" value={averagingMethod.toString()} label="Method" onChange={(e: SelectChangeEvent) => setAveragingMethod(parseInt(e.target.value))}>
                            <MenuItem value={0}>Simple Moving Average</MenuItem>
                            <MenuItem value={1}>Weighted Moving Average</MenuItem>
                            <MenuItem value={2}>Exponential Moving Average</MenuItem>
                        </Select>
                    </div>
                    <p className="text-zinc-600 mb-3">Each averaging method have its benefits and trade-offs, <u>method should be decided based on the volatility, stock sentiment, market trend, etc of the stock. </u>For example, EMA would be a good choice for stocks with high volatility.</p>
                    {averagingMethod == 2 && 
                        <>
                        <div className="mb-3">
                            <h1 className="inline-block text-l mt-5 font-small mb-2 mr-5">Exponential Smoothing</h1>
                            <input className="inline-block p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Period Number" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExpSmoothing(parseFloat(event.target.value))} defaultValue={expSmoothing}></input>
                        </div>
                        <p className="text-zinc-600 mb-10">Whereas in Moving Averages the past observations are weighted equally, exponential smoothing assigns exponentially decreasing weights as the observation get older. <u>Higher smoothing means recent observations are given relatively more weight in forecasting than the older observations.</u></p>
                        </>
                    }
                    
                </>
            case 3:
                return <>
                    <h1 className="text-l font-medium mb-2">How it works</h1>
                    <div className="mb-5">Mean-reversion strategies work on the assumption that there is an underlying stable trend in the price of an asset and prices fluctuate randomly around this trend . Therefore, values deviating far from the trend will tend to reverse direction and revert back to the trend.</div>
                    <h1 className="text-l mt-5 font-medium mb-2">Options</h1>
                    <div className="mb-2">
                        <h1 className="inline-block text-l mt-5 font-small mb-2 mr-5">Period</h1>
                        <input className="inline-block p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Period Number" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPeriod(parseFloat(event.target.value))} defaultValue={period}></input>
                    </div>
                    <p className="text-zinc-600 mb-3">For each date, this specifies a window of days to extract data from. <u>Higher period would therefore lead to more generalized aggregations.</u></p>
                    <div className="mb-2">
                        <h1 className="inline-block text-l mt-5 font-small mb-2 mr-5">Indicator News STD</h1>
                        <input className="inline-block p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Period Number" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewsMultiplier(parseFloat(event.target.value))} defaultValue={newsMultiplier}></input>
                    </div>
                    <p className="text-zinc-600 mb-10">Specifies how many standard deviation above the average news sentiment until buy or sell indicator is signaled. <u>Higher standard deviation means less relaxed, news sentiment for given day need to be needs to be x std above average.</u></p>
                </>
                
        }
    }

    ChartJS.register(CategoryScale, LineElement, LineController, PointElement);

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
                        <h1 className="text-xl mt-5 font-small">{strategy == 3 ? "News Score" : "Stock Price"}</h1>
                        <Line className="flex m-0 h-full" width={100} height={50} data={graphData} />
                        {buySellGraphData && 
                        <>
                          <h1 className="text-xl mt-5 font-small">Buy / Sell Times</h1>
                        <Chart className="flex m-0 h-full" width={100} height={50} type="line" data={buySellGraphData} />
                        </>
                        }
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
                                    <MenuItem value={2}>Momentum</MenuItem>
                                    <MenuItem value={3}>News Analysis</MenuItem>
                                </Select>
                            </div>
                            {renderTradingOptions(strategy)}
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => calcStrategy(strategy)}>Generate</button>
                            </>
                        }
                     </div>
                </div>
                <h1 className="text-xl mt-5 mb-3 font-small">News Data</h1>
                <p className="text-zinc-600 mb-3">News data for {stock} starting from {startDate} to {endDate} represented in volume</p>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-10" onClick={() => setNewsShowMore(!newsShowMore)}>Show {newsShowMore ?  "less" : "all"} data</button>
   
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {Object.keys(newsData[0]).map((key, i) => {
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
                                if (j < 25 || newsShowMore) {
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