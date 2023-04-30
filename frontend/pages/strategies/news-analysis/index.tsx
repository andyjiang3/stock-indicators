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
                    <p>News analysis trading strategies work by measuring news data of a specific stock on a number of relevant attributes, such as information regarding new products or negative news, and then aggregating that data on a given period into a single score. Buy and sell signals are placed when this score is 'X' standard deviations of the mean news score on that period.<br></br>
                    <br></br>For example, look at the graph on the top right. The blue line represents the <strong>news score</strong> on each data that was calculated based on the news data. This score is influenced by any news data regarding positive news, negative news, new products, layoffs, analyst comments, news regarding the stock itself, and dividends. The score can be either positive or negative.<br></br>
                    <br></br>The graph on the bottom right illustrates the generated buy and sell dates using the news analysis trading strategy. These dates are determined by a pre-defined numerical indicator for how many standard deviations above the average news sentiment should be in order to mark a buy/sell date. It is set to 0.5 in this example. Simply put, you can profit from a stock based on news announcements, and the generated news score helps you determine where you should buy or sell stock.<br></br>
                    <br></br>Ready to see for yourself? Just select a stock, enter your desired period and standard deviation indicator, and generate your graphs!
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

    