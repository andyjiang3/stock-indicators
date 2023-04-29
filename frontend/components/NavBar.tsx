import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Stock } from '../constants/types'
import Link from "next/link"
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { url_prefix } from '@/constants/backend_route';

interface NavBarProps {
    startDate: string,
    setStartDate: Dispatch<SetStateAction<string>>,
    endDate: string,
    setEndDate: Dispatch<SetStateAction<string>>
}

const NavBar = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: NavBarProps) => {
    const [stocks, setStocks] = useState<Stock[] | null>(null);
    const [searchVal, setSearchVal] = useState('');
    const changeSearchVal = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchVal(event.target.value);
    }
    const minDate = "2020-10-20";
    const maxDate = "2022-07-29";

    useEffect(() => {
        if (!stocks) {
            fetch(`${url_prefix}/stocks`).then((res) => 
                res.json().then((resJson: Stock[]) => {
                    setStocks(resJson);
                })
            )
        }
    }, [])

    return (
    <div className="bg-white flex p-3 justify-start align-center shadow-sm mb-5 items-center">
        <div className="flex-1">
            <h4 className="text-xl text-blue-500"><Link href="/" className="font-bold">Stock Prediction</Link></h4>
        </div>
        <div className="flex relative justify-center align-middle w-2/3">
           
                <div className="inline-block self-center w-4/6">
                    <input className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Search for stock by symbol or security name" value={searchVal} onChange={changeSearchVal}></input>
                </div>
                {searchVal.length > 0 && 
                    <div className="w-4/6 top-10 left-0 pt-3 pb-3 mr-5 mt-3 absolute bg-white shadow border max-h-52 overflow-scroll">
                        {stocks && stocks.filter((stock: Stock) => {
                                return stock.symbol.toLowerCase().startsWith(searchVal.toLowerCase()) || stock.security.toLowerCase().startsWith(searchVal.toLowerCase());
                            }).map((stock: Stock) => (
                            <div key={stock.symbol} className="hover:bg-blue-300 p-1 pr-4 pl-4">
                                <Link className="block w-full" href={`/stocks/${stock.symbol}`}><span className="font-medium">{stock.symbol}</span><span className="text-zinc-800 ml-3 text-sm">{stock.security}</span></Link>
                            </div>
                            
                        ))}
                    </div>
                }
                {startDate && startDate.length > 0 && endDate && endDate.length > 0 &&
                <>
                    <div className="ml-3 max-h-8 w-1/6 inline-block">
                        <DatePicker className="w-full" label="Start Date" minDate={dayjs(minDate)} maxDate={dayjs(maxDate)} defaultValue={dayjs(startDate)} onChange={(newValue: any) => setStartDate(newValue.format('YYYY-MM-DD'))}></DatePicker>
                    </div>
                    <div className="ml-3 w-1/6 inline-block">
                        <DatePicker className="w-full" label="End Date" minDate={dayjs(minDate)} maxDate={dayjs(maxDate)} defaultValue={dayjs(endDate)} onChange={(newValue: any) => setEndDate(newValue.format('YYYY-MM-DD'))}></DatePicker>
                    </div>
                </>
                }
                
        </div>
        <div className="flex-1 text-right">
            <Link href="/stocks" className="text-base ms-10">Stocks</Link>
            <Link href="/strategies" className="text-base ms-10">Strategies</Link>
        </div>
        
    </div>
    );
}

export default NavBar;