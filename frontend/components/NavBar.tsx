import { useState, useEffect } from 'react'
import { Stock } from '../constants/types'
import Link from "next/link"

export default function NavBar() {
    const [stocks, setStocks] = useState<Stock[] | null>(null);
    const [searchVal, setSearchVal] = useState('');
    const changeSearchVal = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchVal(event.target.value);
    }

    useEffect(() => {
        if (!stocks) {
            fetch(`http://localhost:8080/stocks`).then((res) => 
                res.json().then((resJson: Stock[]) => {
                    setStocks(resJson);
                })
            )
        }
    }, [])

    return (
    <div className="bg-white flex p-3 justify-start align-center shadow-sm mb-5 items-center">
        <div className="flex-1">
            <h4 className="text-xl text-blue-500"><a href="/" className="font-bold">Stock Prediction</a></h4>
        </div>
        <div className="w-1/3">
            <input className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Search for stock by symbol or security name" value={searchVal} onChange={changeSearchVal}></input>
            {searchVal.length > 0 && 
                <div className="w-1/3 pt-3 pb-3 mr-5 mt-3 fixed bg-white shadow border max-h-52 overflow-scroll">
                    {stocks && stocks.filter((stock: Stock) => {
                            return stock.symbol.toLowerCase().startsWith(searchVal.toLowerCase()) || stock.security.toLowerCase().startsWith(searchVal.toLowerCase());
                        }).map((stock: Stock) => (
                        <div key={stock.symbol} className="hover:bg-blue-300 p-1 pr-4 pl-4">
                            <Link className="block w-full" href={`/stocks/${stock.symbol}`}><span className="font-medium">{stock.symbol}</span><span className="text-zinc-800 ml-3 text-sm">{stock.security}</span></Link>
                        </div>
                        
                    ))}
                </div>
            }
        </div>
        <div className="flex-1 text-right">
            <a href="/stocks" className="text-base ms-10">Stocks</a>
            <a href="/strategies" className="text-base ms-10">Strategies</a>
        </div>
        
    </div>
    );
}