//TypeButton.jsx
import { useChartStore } from '../stores/chart';

export default function TypeButton({ type }) {
    const setType = useChartStore((state) => state.setType);
    return (
        <td onClick={() => setType(type)}>
            {type}
        </td>
    );
}