import NavBar from "@/components/NavBar"
import Link from "next/link"
import { FormEvent, useState } from "react"

// import { stocks } from '../../data'

import { TextField } from "@mui/material"
import styles from '../../styles/Home.module.css'

export default function StocksPage({stocks}: Props){
    const [searchVal, setSearchVal] = useState<string>('');

    const changeSearchVal = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchVal(event.target.value);
    }

    return (
        <div className={styles.container}>
            <NavBar />
            <form className={styles.stockSearchBar}>
                <label htmlFor="stockName">Search for a Stock</label>
                <input className={styles.stockSearchInput} type="text" id="stockName" name="stockName" value={searchVal} onChange={changeSearchVal}/>
            </form>
            <div className={styles.stockList}>
                <h1>
                    List of Stocks
                </h1>
                <ul>
                {stocks.filter((stock: Stock) => {
                    return stock.symbol.toLowerCase().startsWith(searchVal.toLowerCase()) || stock.security.toLowerCase().startsWith(searchVal.toLowerCase());
                }).map((stock: Stock) => (
                    <li key={stock.symbol} className={styles.stockListItem}>
                        <Link className={styles.stockListItemLink} href={`/stocks/${stock.symbol}`}>{stock.symbol} – {stock.security}</Link>
                    </li>
                ))
                }
                </ul>
            </div>
        </div>
    )
}


interface Stock {
    symbol: string,
    security: string,
    gics_sector: string,
    gics_sub_industry: string,
    HQ_location: string,
    date_added: Date,
    cik: number,
    founded: number
}

interface Props {
    stocks: Stock[]
}

export async function getStaticProps() {
    const req = await fetch(`http://localhost:8080/stocks`);
    const stocks : Stock[] = await req.json();
    
    return {
        props: {
            stocks
        }
    };
};