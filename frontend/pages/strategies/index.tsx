import NavBar from "@/components/NavBar"
import { Dispatch, SetStateAction } from "react"
import Image from "next/image"
import Link from "next/link"

interface TradingStrategiesProps {
    startDate: string,
    setStartDate: Dispatch<SetStateAction<string>>,
    endDate: string,
    setEndDate: Dispatch<SetStateAction<string>>
}

const TradingStrategies = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: TradingStrategiesProps) => {
    return (<>
            <NavBar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
            <div className="p-10 pt-5">
                <div className="flex justify-start items-baseline flex-col mb-5">
                    <h1 className="text-4xl bold">Trading Strategies</h1>
                </div>

                <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(4, 1fr)", gridColumnGap: "20px", gridRowGap: "10px"}}>
                    <div style={{gridArea: "1 / 1 / 5 / 2", border: "solid 1.5px lightgray", borderRadius: "10px", padding: "10px"}}>
                        <div style={{textAlign: "center"}}>
                            <h1 className="text-3xl text-zinc-800">Mean Reversion</h1>
                            <Image src="/mean-reversion.png" alt="Mean Reversion Graph" width={500} height={500}></Image>
                            <div style={{textAlign: "left"}}>
                                <p>Mean-reversion strategies work on the assumption that there is an underlying stable trend in the price of an asset and prices fluctuate randomly around this trend . Therefore, values deviating far from the trend will tend to reverse direction and revert back to the trend.<br></br><br></br><br></br></p>
                            </div>
                            <Link href="/strategies/mean-reversion">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => null}>Learn More</button>
                            </Link>                        </div>
                    </div>

                    <div style={{gridArea: "1 / 2 / 5 / 3", border: "solid 1.5px lightgray", borderRadius: "10px", padding: "10px"}}>
                        <div style={{textAlign: "center"}}>
                            <h1 className="text-3xl text-zinc-800">Momentum</h1>
                            <Image src="/momentum.png" alt="Momentum Graph" width={500} height={500}></Image>
                            <div style={{textAlign: "left"}}>
                                <p>Momentum trading strategy focuses on buying securities that are rising and sell them when they look to have peaked. The goal is to work with volatility by finding buying opportunities in short-term uptrends and then sell when the securities start to lose momentum.<br></br><br></br><br></br></p>
                            </div>
                            <Link href="/strategies/momentum">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => null}>Learn More</button>
                            </Link>                        </div>
                    </div>

                    <div style={{gridArea: "1 / 3 / 5 / 4", border: "solid 1.5px lightgray", borderRadius: "10px", padding: "10px"}}>
                        <div style={{textAlign: "center"}}>
                            <h1 className="text-3xl text-zinc-800">News Analysis</h1>
                            <Image src="/news-analysis.png" alt="News Analysis Graph" width={500} height={500}></Image>
                            <div style={{textAlign: "left"}}>
                                <p>News anaylsis trading strategies work by measuring news data of a specific stock on a number of relevant attributes, such as information regarding new products or negative news, and then aggregating that data on a given period into a single score. Buy and sell signals are placed when this score is 'X' standard deviations of the mean news score on that period.</p>
                            </div>
                            <Link href="/strategies/news-analysis">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => null}>Learn More</button>
                            </Link>
                        </div>
                    </div>

                </div>
                
            </div>
            </>

    )
}

export default TradingStrategies