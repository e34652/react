import { useQuery } from "@tanstack/react-query";
import TypeButton from "./TypeButton";
import axios from 'axios'
import TimeButton from "./TimeButton";
import Chart from "./Chart";
import { useChartStore } from '../stores/chart'; // Zustand store import

export default function DashBoard() {

    // Zustand의 selectedType 상태를 가져옴
    const selectedType = useChartStore((state) => state.selectedType);
    const selectedPeriod = useChartStore((state) => state.selectedPeriod);

    function loadData() {
        return axios.get("/api/data")
            .then(response => {
                return response.data;
            });
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ["data"],
        queryFn: loadData
    })


    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error </p>;

    // 데이터가 모두 로딩된 후에 chartData와 labels 생성
    let filteredRecords = [...data.records].reverse();

    // selectedPeriod에 따라 보여줄 데이터 양 조절
    if (selectedPeriod === "day") {
        filteredRecords = filteredRecords.slice(0, 1); // 오늘 하루 데이터
    } else if (selectedPeriod === "week") {
        filteredRecords = filteredRecords.slice(0, 7); // 최근 7일 데이터
    } else if (selectedPeriod === "month") {
        filteredRecords = filteredRecords.slice(0, 30); // 최근 30일 데이터
    }

    const chartData = filteredRecords.map(record => record[selectedType]);
    const labels = filteredRecords.map(record => record.date);

    return (
        <div>
            <table>
                <tbody>
                    <tr>
                        {data.types.map(type => (
                            <TypeButton type={type.type} key={type.id} />
                        ))}
                    </tr>
                    <tr>
                        {data.timeframes.map(timeframe => (
                            <TimeButton period={timeframe.period} key={timeframe.id} />
                        ))}
                    </tr>
                </tbody>
            </table>
            <div>
                <h2>차트</h2>
                <Chart chartData={chartData} labels={labels} />
            </div>
        </div>

    )
}