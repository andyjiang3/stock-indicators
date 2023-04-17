import NavBar from "@/components/NavBar"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { TextField } from "@mui/material"

import { Stock } from "../../constants/types"

const StocksHome = () => {
    const [stocks, setStocks] = useState<Stock[] | null>(null);
    const [searchVal, setSearchVal] = useState('');
    const changeSearchVal = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchVal(event.target.value);
    }

    useEffect(() => {
        fetch(`http://localhost:8080/stocks`).then((res) => 
            res.json().then((resJson: Stock[]) => {
                setStocks(resJson);
            })
        )
    }, [stocks])

    return (
        <div>
            <NavBar />
                <div className="p-10 pt-0">
                    <form style={{padding: "auto", margin: "auto"}}>
                        <label htmlFor="stockName">Search for a Stock</label>
                        <input style={{border: "1px solid black", padding: "12px 20px", width: "100%"}} type="text" id="stockName" name="stockName" value={searchVal} onChange={changeSearchVal}/>
                    </form>
                <div style={{textAlign: "center"}}>
                    <ul>
                    {stocks && stocks.filter((stock: Stock) => {
                            return stock.symbol.toLowerCase().startsWith(searchVal.toLowerCase()) || stock.security.toLowerCase().startsWith(searchVal.toLowerCase());
                        }).map((stock: Stock) => (
                        <li key={stock.symbol}>
                            <Link href={`/stocks/${stock.symbol}`}>{stock.symbol} – {stock.security}</Link>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default StocksHome;