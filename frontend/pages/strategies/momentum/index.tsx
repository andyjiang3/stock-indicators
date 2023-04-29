import NavBar from '@/components/NavBar';
import { Dispatch, SetStateAction } from 'react';


interface TradingStrategiesProps {
    startDate: string,
    setStartDate: Dispatch<SetStateAction<string>>,
    endDate: string,
    setEndDate: Dispatch<SetStateAction<string>>
}

const MomentumStrategy = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: TradingStrategiesProps) => {


    return (<>
        <NavBar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
        <div>Momentum</div>
    </>)
}

export default MomentumStrategy;

    