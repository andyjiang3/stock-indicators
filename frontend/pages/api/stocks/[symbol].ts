import { NextApiResponse, NextApiRequest } from 'next'
import { stocks } from '../../../data' //will eventually connect to RDS

type Stock = {
    symbol: string,
    security: string,
    gics_sector: string,
    gics_sub_industry: string,
    HQ_location: string,
    date_added: string, //to Date format, eventually
    cik: number,
    founded: number
}

type Error = {
    message: string
}
  
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Stock | Error>
) {
    const id = req.query.symbol
    const stock = stocks.find((s) => s.symbol === id)

    return stock ? res.status(200).json(stock) : res.status(404).json({message: `No stocks match the symbol ${id}.`});
}