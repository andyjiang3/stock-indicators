import NavBar from '@/components/NavBar'
import { useEffect, useState } from 'react'
import { Stock } from '@/constants/types'
import { CircularProgress } from '@mui/material';


export default function Home() {

  const [randomStock, setRandomStock] = useState<Stock | null>(null);
  const [hotStocks, setHotStocks] = useState<Stock[] | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/random`).then((res) => 
        res.json().then((resJson: Stock) => {
          setRandomStock(resJson);
        })
    );

    fetch(`http://localhost:8080/hotStocks`).then((res) => 
      res.json().then((resJson: Stock[]) => {
        setHotStocks(resJson);
      })
    );

  }, [])

  return (
  <div className="h-screen">
    <NavBar />
    <div className="p-10 pt-5">
      <h1 className="text-xl mt-5 font-medium mb-5">Hot Stocks</h1>
      <div className="grid grid-cols-5 gap-4 h-46 mb-8">
        {hotStocks ? hotStocks.map((data, i) => {
            
          return (<div className="flex-row bg-white h-full w-full border border-gray-300 justify-center text-center p-1 pt-2 rounded-md">
              <div className="text-sm font-bold mb-3">{data.symbol}</div>
              <div className="">{data.security}</div>
          </div>)
            
        }) : 
        <div className="flex justify-center">
          <CircularProgress/>
        </div> 
      }
      </div>
      <h1>Random Stock: {randomStock?.symbol}</h1>
    </div>
  </div> 
  )
}
