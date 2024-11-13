//TimeButton.jsx
import { useChartStore } from '../stores/chart';

export default function TimeButton({ period }) {
    const setPeriod = useChartStore((state) => state.setPeriod);
    return (
        <td onClick={() => setPeriod(period)}>
            {period}
        </td>
    );
}