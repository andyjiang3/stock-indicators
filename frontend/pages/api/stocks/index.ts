import { NextApiResponse, NextApiRequest } from 'next'
import { stocks } from '../../../data' //will eventually connect to RDS

type Stock = {
    symbol: string,
    security: string,
    gics_sector: string,
    gics_sub_industry: string,
    HQ_location: string,
    date_added: string, //to Date format
    cik: number,
    founded: number
}
  
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Stock[]>
) {
    res.status(200).json(stocks)
}