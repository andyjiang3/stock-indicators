import { useRouter } from 'next/router'

export default function Stock({stock}:{stock:any}) {

    const router = useRouter();
    const {id} = router.query;

    return (<>
        <h1>Stock: {id}</h1>
        <table>
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
                    <td>{stock.HQ_location}</td>
                    <td>{stock.date_added}</td>
                    <td>{stock.cik}</td>
                    <td>{stock.founded}</td>
                </tr>
            </tbody>
        </table>
    </>)
}

export async function getStaticProps({params} : {params:any}) {
    const request = await fetch(`http://localhost:3000/${params.id}.json`);
    const data = await request.json();

    return {
        props: { stock: data},
    }
}

export async function getStaticPaths(){
    const request = await fetch(`http://localhost:3000/stocks.json`);
    const data = await request.json();

    const paths = data.map((stock: any) => {
        return {params: { id: stock}}
    })

    return {
        paths,
        fallback: false
    }

}