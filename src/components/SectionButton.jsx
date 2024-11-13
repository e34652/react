// SectionButton.jsx
import { Link } from "react-router-dom";

export default function SectionButton({ section }) {
    return (
        <td>
            <Link to={`/${section.name}`}>{section.name}</Link>
        </td>
    );
}
