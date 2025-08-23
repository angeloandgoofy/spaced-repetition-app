import { useQuery } from '@apollo/client';
import { GET_DECK } from '../graphql/queries';
import { useState } from 'react';

interface Card {
  id: string;
  front: string;
  back: string;
  isDue: string
}

interface Deck {
  id: string;
  title: string;
  cardCount: number;
  cards: Card[];
}

interface DeckData {
  deck: Deck;
}


function DeckCard({ deckId }: { deckId: string | null}) {
  const { loading, error, data } = useQuery<DeckData>(GET_DECK, { 
    variables: { id: deckId } 
  });

  const hard = [1,2,3,4,5];
  const [indexC, setIndex] = useState(0);
  const[back, setBack] = useState(false);

  const handleDiffilculty = () =>{
    setBack(false);
    setIndex((prev) => prev >= cards.length -1 ? prev % cards.length: prev + 1);
  }

  const cards = data?.deck?.cards ?? [];

 
  if(cards.length === 0){
    return (
        <div>
            <p>No cards available</p>
        </div>
    )
  }
 

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading Deck: {error.message}</p>;

  return (
    <div className="deck-card-container">
      <h1>{data?.deck.title}</h1>
        <div className='card-container'>
            {!back ? 
            <div>
                <p>{cards[indexC].front}</p>
                <button onClick={() => setBack(true)}> BACK</button>
            </div> :(
                <div>
                    <p>{cards[indexC]?.back ?? "No back text available"}</p>
                    {[1,2,3,4,5].map((difficulty) => (
                    <button
                    key={difficulty}
                    onClick={() => {
                        handleDiffilculty();
                    }}
                    >
                    {difficulty}
                    </button>
                    ))}
                </div>
                )}
        </div>
    </div>
  );
}

export default DeckCard;