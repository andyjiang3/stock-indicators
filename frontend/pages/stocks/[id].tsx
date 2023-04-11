import { useRouter } from 'next/router'
import NavBar from "@/components/NavBar"

import styles from '../../styles/Home.module.css'

export default function Stock({thisStock}:{thisStock:Stock}) {

    const router = useRouter();

    if(!thisStock) {
        return <div>The requested stock was not found.</div>
    }

    return (<div className={styles.container}>
        <NavBar />
            <h1>{thisStock.symbol}</h1>
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
                        <td>{thisStock.symbol}</td>
                        <td>{thisStock.security}</td>
                        <td>{thisStock.gics_sector}</td>
                        <td>{thisStock.gics_sub_industry}</td>
                        <td>{thisStock.headquarters_location}</td>
                        <td>{thisStock.date_first_added}</td>
                        <td>{thisStock.cik}</td>
                        <td>{thisStock.founded}</td>
                    </tr>
                </tbody>
            </table>
    </div>)
}


interface Stock {
    symbol: string,
    security: string,
    gics_sector: string,
    gics_sub_industry: string,
    headquarters_location: string,
    date_first_added: string,
    cik: number,
    founded: number
}

interface Props {
    thisStock: Stock
}

export async function getStaticProps(context:any) {
    const { id } = context.params;
    const request = await fetch(`http://localhost:8080/stocks/${id}`);
    const thisStock : Stock = await request.json();

    return {
        props: {
            thisStock
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