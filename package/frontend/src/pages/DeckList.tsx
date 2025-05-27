import { useQuery } from "@apollo/client";
import { GET_DECKS } from "../graphql/queries";

function DeckList() {
    const { data, loading, error } = useQuery(GET_DECKS);

    if(!loading) return <p>Loading...</p>
    if(error) return <p>Error fetching decks</p>

    return (
        <div>
            <h1>Your Decks</h1>
            <ul>
                {data?.decks.map( (deck: any) => {
                    <li key={deck.id}>{deck.title} - {deck.cardCount} cards</li>
                })}
            </ul>
        </div>
    )
}

export default DeckList;