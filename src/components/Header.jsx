//Header.jsx
import { useQuery } from "@tanstack/react-query";
import SectionButton from "./SectionButton";
import axios from 'axios'

export default function Header() {

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

    return (
        <div>
            <table>
            <tbody>
                <tr>
                {data.sections.map(section => (
                    <SectionButton section={section} key={section.id} />
                ))}
                </tr>
            </tbody>
            </table>
        </div>

    )
}