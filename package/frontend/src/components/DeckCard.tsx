import { useMutation, useQuery } from '@apollo/client';
import { GET_DECK } from '../graphql/queries';
import { DELETE_CARD, REVIEW_CARD } from "../graphql/mutations";

import { useEffect, useState } from 'react';

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

  const { loading, error, data, refetch } = useQuery<DeckData>(GET_DECK, { 
    variables: { id: deckId } 
  });

  const [deleteMutation] = useMutation(DELETE_CARD);
  const cards = data?.deck?.cards ?? [];
  const hard = [1,2,3,4,5];
  const [indexC, setIndex] = useState(0);
  const[back, setBack] = useState(false);

  const handleDiffilculty = () =>{
    setBack(false);
    setIndex(prev => (prev + 1) % cards.length);
  }

  const deleteCard = async (cardId: string)=> {
       if (!confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
          return;
        }
        try{
          await deleteMutation({variables: {id: cardId}});          
          await refetch();
        }catch(err: any){
          console.error("Error deleting card: ", err);
        }
  }
 
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
      <h3>{data?.deck.title}</h3>
        <div className='card-container'>
            {!back ? 
            <div>
                <h2>{cards[indexC]?.front}</h2>
                <div style={{display: "flex", justifyContent: "center", gap: "5rem"}}>
                  <button onClick={() => setBack(true)}> BACK</button>
                  <button onClick={() => {deleteCard(cards[indexC].id)}}> DELETE </button>
                </div>
            </div> :(
                <div>
                    <p>{cards[indexC]?.back ?? "No back text available"}</p>
                    {hard.map((difficulty) => (
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