import NavBar from '@/components/NavBar';
import Link from 'next/link';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';


interface TradingStrategiesProps {
    startDate: string,
    setStartDate: Dispatch<SetStateAction<string>>,
    endDate: string,
    setEndDate: Dispatch<SetStateAction<string>>
}

const MomentumStrategy = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: TradingStrategiesProps) => {


    return (<>
        <NavBar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
        <div className="p-10 pt-5">
            <div className="flex justify-start items-baseline flex-col mb-5">
                <h1 className="text-4xl bold">Momentum</h1>
            </div>

            <div style={{display: "flex"}}>
                <div style={{}}>
                    <p>
                        The Momentum trading strategy focuses on buying securities that are rising and selling them when they appear to have peaked. The goal is to work with volatility by finding buying opportunities in short-term uptrends and then sell when the securities start to lose momentum.<br></br>
                        <br></br>For example, look at the graph on the top right. The blue line represents the <strong>closing price of the selected stock on each day</strong>. The orange line represents the <strong>rolling mean</strong> at each date, an average of the price based on a specific averaging method. The averaging methods we provide are either <i>simple</i> (arithmetic mean of a set of prices over a specific period of days), <i>weighted</i> (weighted average which gives greater importance to the most recent stock prices), or <i>exponential</i> (weighted average but with the rate of decrease being exponential instead of consistent). Each averaging method has its benefits and trade-offs, so the method should be decided based on the volatility, stock sentiment, market trend, etc of the stock. For example, exponential would be a good choice for stocks with high volatility.<br></br>
                        <br></br>The graph on the bottom right shows the buy and sell dates produced from the momentum strategy for a simple moving average. The buy dates are generated when a short-term uptrend has been identified, and the sell dates are generated when the stock has begun to lose its momentum.<br></br>
                        <br></br>Ready to see for yourself? Just select a stock, enter your desired period and averaging method, and generate your graphs!
                    </p>
                    <div style={{textAlign: "center", padding: "15px"}}>
                    <Link href="/stocks">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => null}>Try it out!</button>
                    </Link>
                    </div>
                </div>
                <div>
                    <Image src="/momentum.png" alt="Momentum Graph" width={3000} height={3000}></Image>
                    <Image src="/moment-buysell.png" alt="Momentum Buy/Sell Graph" width={2000} height={2000}></Image>
                </div>
            </div>
        </div>
    </>)
}

export default MomentumStrategy;

    