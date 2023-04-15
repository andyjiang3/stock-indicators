import NavBar from "@/components/NavBar"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { TextField } from "@mui/material"

import { Stock } from "../../constants/types"

const StocksHome = () => {
    const [stocks, setStocks] = useState<Stock[] | null>(null);
    const [searchVal, setSearchVal] = useState('');
    const printVal = (e : FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(searchVal);
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
                <form onSubmit={printVal}>
                    <TextField
                        id="stock-searchbar"
                        label="Search by Symbol"
                        variant="outlined"
                        onInput={(e : React.FormEvent<HTMLInputElement>) => setSearchVal(e.currentTarget.value)}/>
                </form>
                <div>
                    <h1>
                        List of Stocks
                    </h1>
                    <ul>
                    {stocks && stocks.map((stock: Stock) => (
                        <li key={stock.symbol}>
                            <Link href={`/stocks/${stock.symbol}`}>{stock.symbol}</Link>
                            {/* <ul>{stock.security}</ul>
                            <ul>{stock.gics_sector}</ul>
                            <ul>{stock.gics_sub_industry}</ul>
                            <ul>{stock.HQ_location}</ul>
                            <ul>{stock.date_added}</ul>
                            <ul>{stock.cik}</ul>
                            <ul>{stock.founded}</ul> */}
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default StocksHome;