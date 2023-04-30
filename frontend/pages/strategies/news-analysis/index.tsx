import NavBar from '@/components/NavBar';
import { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import Image from 'next/image';


interface TradingStrategiesProps {
    startDate: string,
    setStartDate: Dispatch<SetStateAction<string>>,
    endDate: string,
    setEndDate: Dispatch<SetStateAction<string>>
}

const NewsAnalysisStrategy = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: TradingStrategiesProps) => {


    return (<>
        <NavBar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
        <div className="p-10 pt-5">
            <div className="flex justify-start items-baseline flex-col mb-5">
                <h1 className="text-4xl bold">News Analysis</h1>
            </div>

            <div style={{display: "flex"}}>
                <div style={{}}>
                    <p>Mean-reversion strategies work on the assumption that there is an underlying stable trend in the price of an asset and prices fluctuate randomly around this trend. Therefore, values deviating far from the trend will tend to reverse direction and revert back to the trend.<br></br>
                    <br></br>For example, look at the graph on the top right. The blue line represents the <strong>closing price of the selected stock on each day</strong>. The orange line represents the <strong>20 day moving average</strong>, the average price of the stock over the last 20-day period. The gray shaded region on the graph represents the <strong>bollinger bands</strong>, which shows a standard deviation level above and below the moving average of the stock's price.<br></br>
                    <br></br>This strategy relies on the assumption that the price of the stock will eventually revert back to its average levels. The common analogy is that it should act like a rubber band: if its stretched too far out, it will snap right back. With mean reversion, it is possible to find profitable trades when the close price extends past the bounds of the bollinger bands. <u>If the close price is <i>higher</i> than the upper bollinger bound, then <i>buying</i> the stock would be profitable.</u> <u>If the close price is <i>lower</i> than the lower bollinger bound, then <i>selling</i> the stock would be a profitable move.</u> The graph on the bottom right displays the buying and selling points of the graph above it.<br></br>
                    <br></br>Ready to see for yourself? Just select a stock, enter your desired period and multiplier, and generate your graphs!
                    </p>
                    <div style={{textAlign: "center", padding: "15px"}}>
                    <Link href="/stocks">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => null}>Try it out!</button>
                    </Link>
                    </div>
                </div>
                <div>
                    <Image src="/news-analysis.png" alt="News Analysis Graph" width={3000} height={3000}></Image>
                    <Image src="/news-buysell.png" alt="News Analysis Buy/Sell Graph" width={2000} height={2000}></Image>
                </div>
            </div>
        </div>
    </>)
}

export default NewsAnalysisStrategy;

    