import { useQuery } from '@apollo/client';
import { GET_DECK } from '../graphql/queries';

function DeckCard({deckId}: {deckId: string}) {
    const { loading, error, data } = useQuery(GET_DECK, { variables: { id: deckId } });

    if(!loading) return <p>Loading...</p>
    if(error) return <p> Error loading Deck </p>

    return(
        <div>
            <h1>{data?.deck.title}</h1>
            <p>{data?.deck?.cardCount}</p>
            <ul>
                {data?.deck?.cards.map((card: any) =>{
                    <li key={card.id}>
                        <strong>Front: </strong>{card.front}<br />
                        <strong>Back: </strong>{card.back}<br />
                        <strong>Due: </strong>{card.isDue ? 'yes' : 'no'}<br />
                    </li>
                })}
            </ul>

        </div>
    )
}

export default DeckCard