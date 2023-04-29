import NavBar from '@/components/NavBar';
import { Dispatch, SetStateAction } from 'react';


interface TradingStrategiesProps {
    startDate: string,
    setStartDate: Dispatch<SetStateAction<string>>,
    endDate: string,
    setEndDate: Dispatch<SetStateAction<string>>
}

const NewsAnalysisStrategy = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: TradingStrategiesProps) => {


    return (<>
        <NavBar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
        <div>News Analysis</div>
    </>)
}

export default NewsAnalysisStrategy;

    