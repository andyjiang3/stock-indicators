import NavBar from '@/components/NavBar'
import { useEffect, useState } from 'react'
import { Stock } from '@/constants/types'

import styles from '../components/homepage.module.css'
import Link from 'next/link';

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
  <div className={styles.container}>
    <NavBar />
    <div className={styles.content}>
      {/* <h1 className={styles.randomStock}>Random Stock: {randomStock?.symbol}</h1> */}
      <h1 className={styles.randomStock}>
        <Link href={`/stocks/${randomStock?.symbol}`}>Random Stock: {randomStock?.symbol} -- {randomStock?.security}</Link>
      </h1>
      <ul className={styles.hotStocks}>
      {hotStocks && hotStocks.map((s : Stock) => (
        <li key={s.symbol}>
          <Link href={`/stocks/${s.symbol}`}>{s.symbol} -- {s.security}</Link>
        </li>
      ))}
      </ul>
    </div>
  </div> 
  )
}
