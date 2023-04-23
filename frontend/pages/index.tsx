import NavBar from '@/components/NavBar'
import { useEffect, useState } from 'react'
import { Stock } from '@/constants/types'

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
    <div>
      <h1>Random Stock: {randomStock?.symbol}</h1>
      {hotStocks && hotStocks.map((s : Stock) => (
        <li key={s.symbol}>{s.symbol} -- {s.security}</li>
      ))}
    </div>
  </div> 
  )
}
