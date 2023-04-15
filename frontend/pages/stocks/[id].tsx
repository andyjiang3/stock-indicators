import { useRouter } from 'next/router'
import NavBar from "@/components/NavBar"
import { Stock } from "../../constants/types"

export async function getStaticProps(context:any) {
    const { id } = context.params;
    const request = await fetch(`http://localhost:8080/stocks/${id}`);
    const stock : Stock = await request.json();

    return {
        props: {
            stock
        }
    };
}

export async function getStaticPaths() {
    const request = await fetch(`http://localhost:8080/stocks`);
    const allStocks = await request.json();

    const paths = allStocks.map((stock: Stock) => ({
        params: { id: stock.symbol}
    }));

    return {
        paths,
        fallback: false
    }
}

interface StockProps {
    stock: Stock
}

const Stock = ({
    stock
}: StockProps) => {
    const router = useRouter();

    if(!stock) {
        return <div>The requested stock was not found.</div>
    }

    return (
    <div>
        <NavBar />
            <h1>{stock.symbol}</h1>
            <table border={1} cellSpacing={3}>
                <tbody>
                    <tr>
                        <th>Symbol</th>
                        <th>Security</th>
                        <th>GICS Sector</th>
                        <th>GICS Sub Industry</th>
                        <th>HQ Location</th>
                        <th>Date Added</th>
                        <th>CIK</th>
                        <th>Year Founded</th>
                    </tr>
                    <tr>
                        <td>{stock.symbol}</td>
                        <td>{stock.security}</td>
                        <td>{stock.gics_sector}</td>
                        <td>{stock.gics_sub_industry}</td>
                        <td>{stock.headquarters_location}</td>
                        <td>{stock.date_first_added}</td>
                        <td>{stock.cik}</td>
                        <td>{stock.founded}</td>
                    </tr>
                </tbody>
            </table>
    </div>
    )
}

export default Stock;