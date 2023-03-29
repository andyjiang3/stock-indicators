import Link from "next/link"

export default function StockList() {
    return (
        <div>
            <h1>
                List of Stocks
            </h1>
            <ul>
                <li>
                    <Link href="/stocks/AAPL">AAPL</Link>
                </li>
                <li>
                    <Link href="/stocks/AMZN">AMZN</Link>
                </li>
            </ul>
        </div>
        
        
    )
}