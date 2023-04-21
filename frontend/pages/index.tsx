import NavBar from '@/components/NavBar'
import { useEffect, useState } from 'react'
import { Stock } from '@/constants/types'

export default function Home() {

  const [randomStock, setRandomStock] = useState<Stock | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/random`).then((res) => 
        res.json().then((resJson: Stock) => {
          console.log(resJson);
          setRandomStock(resJson);
        })
    )
}, [])


  return (
  <div className="h-screen">
    <NavBar />
    <div>
      <h1>Random Stock: {randomStock?.symbol}</h1>
      
    </div>
  </div> 
  )
}
