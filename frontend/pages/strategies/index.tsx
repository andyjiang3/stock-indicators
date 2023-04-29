import NavBar from "@/components/NavBar"
import { Dispatch, SetStateAction } from "react"

interface TradingStrategiesProps {
    startDate: string,
    setStartDate: Dispatch<SetStateAction<string>>,
    endDate: string,
    setEndDate: Dispatch<SetStateAction<string>>
}

const TradingStrategies = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate
}: TradingStrategiesProps) => {
    return (<>
            <NavBar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
            <div>List of Trading Strategies</div>
            </>

    )
}

export default TradingStrategies