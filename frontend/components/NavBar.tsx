import { useState, useEffect } from 'react'
import { Stock } from '../constants/types'

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
        <h4 className="text-xl text-blue-500"><a href="/" className="font-bold">Stock Prediction</a></h4>
        <div className="self-center">
            <input className="self-center p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Search for stock by symbol or security name"></input>
        </div>
        <div className="flex ms-auto">
            <a href="/stocks" className="text-base ms-10">Stocks</a>
            <a href="/strategies" className="text-base ms-10">Strategies</a>
        </div>
        
    </div>
    );
}