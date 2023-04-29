import NavBar from '@/components/NavBar'
import { useEffect, useState } from 'react'
import { Stock } from '@/constants/types'
import { CircularProgress } from '@mui/material';
import Link from "next/link"


export default function Home() {

  const [randomStock, setRandomStock] = useState<Stock | null>(null);
  const [hotStocks, setHotStocks] = useState<Stock[] | null>(null);
  const [topMovers, setTopMovers] = useState(null);
  const [mostVolatile, setMostVolatile] = useState(null);

  const getRandomStock = () => {
    fetch(`http://localhost:8080/random`).then((res) => 
        res.json().then((resJson: Stock) => {
          setRandomStock(resJson);
        })
    );
  }

  useEffect(() => {
    getRandomStock();

    fetch(`http://localhost:8080/hotStocks`).then((res) => 
      res.json().then((resJson: Stock[]) => {
        setHotStocks(resJson);
      })
    );

    fetch(`http://localhost:8080/ranking`).then((res) => 
      res.json().then((resJson) => {
        setTopMovers(resJson);
      })
    );

    fetch(`http://localhost:8080/volatility`).then((res) => 
      res.json().then((resJson) => {
        setMostVolatile(resJson);
      })
    );

  }, [])

  return (
  <div className="h-screen">
    <NavBar />
    <div className="p-10 pt-5">
      <h1 className="text-xl mt-5 font-medium">Random Stock 🎲</h1>
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
      <p className="mb-10">Determined using data analysis on news sentiment and market trends, stocks with most positive upticks are considered as hot stocks.</p>
      {hotStocks ? <div className="grid grid-cols-5 gap-4 h-46 mb-16">
        {hotStocks.map((data, i) => {
          return (<div className="relative hover:bg-blue-500 hover:text-white flex-row bg-white h-full w-full border border-gray-300 justify-center text-center p-1 pt-2 rounded-md">
              <Link href={`/stocks/${data.symbol}`}>
                <span className="text-medium text-4xl absolute left-0 bottom-2/3 text-zinc-500">{i + 1}</span>
                <div className="text-sm font-bold mb-3">{data.symbol}</div>
                <div className="">{data.security}</div>
              </Link>
          </div>)
            
        })}
        </div>
         : 
        <div className="flex w-full justify-center align-center">
          <CircularProgress/>
        </div> 
        }
     
      <h1 className="text-xl mt-5 font-medium">Top Movers 📈</h1>
      <p className="mb-10">Stocks that had the biggest upward price movement from starting date to ending date</p>
      {topMovers ? <div className="grid grid-cols-5 gap-4 h-46 mb-15">

        {(topMovers as any).map((data: any, i: any) => {
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
            
        })
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
