import NavBar from '@/components/NavBar'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Stock } from '@/constants/types'
import { CircularProgress } from '@mui/material';
import Link from "next/link"
import dayjs from 'dayjs';
import { url_prefix } from '@/constants/backend_route';


interface HomeProps {
  startDate: string,
  setStartDate: Dispatch<SetStateAction<string>>,
  endDate: string,
  setEndDate: Dispatch<SetStateAction<string>>
}

const Home = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: HomeProps) => {

  const [randomStock, setRandomStock] = useState<Stock | null>(null);
  const [hotStocks, setHotStocks] = useState(null);
  const [topMovers, setTopMovers] = useState(null);
  const [mostVolatile, setMostVolatile] = useState(null);

  const getRandomStock = () => {
    fetch(`${url_prefix}/random`).then((res) => 
        res.json().then((resJson: Stock) => {
          setRandomStock(resJson);
        })
    );
  }

  useEffect(() => {
    getRandomStock();
    

    fetch(`${url_prefix}/hotStocks?start=${startDate}&end=${endDate}`).then((res) => 
      res.json().then((resJson) => {
        setHotStocks(resJson);
      })
    );

    fetch(`${url_prefix}/ranking?start=${startDate}&end=${endDate}`).then((res) => 
      res.json().then((resJson) => {
        setTopMovers(resJson);
      })
    );

    fetch(`${url_prefix}/volatility?start=${startDate}&end=${endDate}`).then((res) => 
      res.json().then((resJson) => {
        setMostVolatile(resJson);
      })
    );
  }, [endDate, startDate])

  useEffect(() => {
    setHotStocks(null);
    setTopMovers(null);
    setRandomStock(null);
    setMostVolatile(null);

  }, [endDate, startDate])

  return (
  <div className="h-screen">
    <NavBar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
    <div className="p-10 pt-5">
    <h1 className="text-3xl font-bold">{dayjs(startDate).format('MMMM DD, YYYY').toString()} to {dayjs(endDate).format('MMMM DD, YYYY').toString()}</h1>
      <h1 className="text-xl mt-10 font-medium">Random Stock 🎲</h1>
      <p className="mb-3">Explore new stocks!</p>
      <button className="mb-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={getRandomStock}>I'm Feeling Lucky</button>
      { randomStock ?
        <div className="grid grid-cols-1 gap-4 h-46 mb-16">
          <div className="relative hover:bg-blue-500 hover:text-white flex-row bg-white h-full w-full border border-gray-300 justify-center text-center p-1 pt-2 rounded-md">
            <Link href={`/stocks/${randomStock.symbol}`}>
              <div className="text-sm font-bold mb-3">{randomStock.symbol}</div>
              <div className="">{randomStock.security}</div>
            </Link>
          </div>
        </div>
        :
        <div className="flex w-full justify-center align-center">
        <CircularProgress/>
      </div> 
      }
      <h1 className="text-xl mt-5 font-medium">Hot Stocks 🔥</h1>
      <p className="mb-10">Stocks with the most postive upticks, determined using data analysis on news sentiment and market trends.</p>
      {hotStocks ? <div className="grid grid-cols-5 gap-4 h-46 mb-16">
        {(hotStocks as any).length > 0 ? (hotStocks as any).map((data: any, i: any) => {
          return (<div className="relative hover:bg-blue-500 hover:text-white flex-row bg-white h-full w-full border border-gray-300 justify-center text-center p-1 pt-2 rounded-md">
              <Link href={`/stocks/${data.symbol}`}>
                <span className="text-medium text-4xl absolute left-0 bottom-3/4 text-zinc-500">{i + 1}</span>
                <div className="text-sm font-bold mb-3">{data.symbol}</div>
                <div className="mb-3">{data.security}</div>
                <div className="text-green-700">{Math.round(data.upticks * 100) / 100} positive upticks</div>

              </Link>
          </div>)
            
        }) :
        <p>No data available for this date range</p>
        }
        </div>
         : 
        <div className="flex w-full justify-center align-center">
          <CircularProgress/>
        </div> 
        }
     
      <h1 className="text-xl mt-5 font-medium">Top Movers 📈</h1>
      <p className="mb-10">Stocks that had the biggest upward price movement from {startDate} to {endDate}.</p>
      {topMovers ? <div className="grid grid-cols-5 gap-4 h-46 mb-16">
        {(topMovers as any).length > 0 ? (topMovers as any).map((data: any, i: any) => {
          if (i < 10) {
            return (<div className="relative hover:bg-blue-500 hover:text-white flex-row bg-white h-full w-full border border-gray-300 justify-center text-center p-1 pt-2 rounded-md">
                <Link href={`/stocks/${data.symbol}`}>
                  <span className="text-medium text-4xl absolute left-0 bottom-3/4 text-zinc-500">{i + 1}</span>
                  <div className="text-sm font-bold mb-3">{data.symbol}</div>
                  <div className="mb-3">{data.security}</div>
                  <div className="text-green-700">${Math.round(data.price_change * 100) / 100} increase</div>
                </Link>
                
            </div>)
          }
            
        }) :
         <p>No data available for this date range</p>
        }
        </div> : 
        <div className="flex w-full justify-center align-center">
          <CircularProgress/>
        </div> 
      }

    <h1 className="text-xl mt-5 font-medium">Most Volatile 💥</h1>
      <p className="mb-10">Stocks with the biggest price fluctuations from {startDate} to {endDate}.</p>
      {mostVolatile ? <div className="grid grid-cols-5 gap-4 h-46 mb-15">

        {(mostVolatile as any).length > 0 ? (mostVolatile as any).map((data: any, i: any) => {
          if (i < 10) {
            return (<div className="relative hover:bg-blue-500 hover:text-white flex-row bg-white h-full w-full border border-gray-300 justify-center text-center p-1 pt-2 rounded-md">
                <Link href={`/stocks/${data.symbol}`}>
                  <span className="text-medium text-4xl absolute left-0 bottom-3/4 text-zinc-500">{i + 1}</span>
                  <div className="text-sm font-bold mb-3">{data.symbol}</div>
                  <div className="mb-3">{data.security}</div>
                  <div className="text-red-700">{Math.round(data.volatility * 100) / 100} volatility</div>
                </Link>
                
            </div>)
          }
            
        }) :
          <p>No data available for this date range</p>
        }
        </div> : 
        <div className="flex w-full justify-center align-center">
          <CircularProgress/>
        </div> 
      }
      
      
      
    </div>
  </div> 
  )
}

export default Home;