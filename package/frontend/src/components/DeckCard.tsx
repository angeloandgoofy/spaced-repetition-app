import { useMutation, useQuery } from '@apollo/client';
import { GET_DECK } from '../graphql/queries';
import { DELETE_CARD, REVIEW_CARD } from "../graphql/mutations";
import { useEffect, useState } from 'react';

interface Card {
  id: string;
  front: string;
  back: string;
  isDue: boolean;
  dueDate: string;
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
    variables: { id: deckId }, 
    skip: !deckId
  });
  
   const [deleteMutation] = useMutation(DELETE_CARD, {
    // Optimistically update the cache
    refetchQueries: [{ query: GET_DECK, variables: { id: deckId } }]
  });
  
  const [reviewMutation] = useMutation(REVIEW_CARD, {
    // Optimistically update the cache  
    refetchQueries: [{ query: GET_DECK, variables: { id: deckId } }]
  });

  const cards = data?.deck?.cards ?? [];

  const difficultyMap = [
    { label: "Again", quality: 1, color: "#ef4444" },
    { label: "Hard",  quality: 3, color: "#f97316" },   
    { label: "Good",  quality: 4, color: "#22c55e" }, 
    { label: "Easy",  quality: 5, color: "#3b82f6" },
  ];

  const [indexC, setIndex] = useState(0);
  const[back, setBack] = useState(false);

  const handleDifficulty = async (cardId: string, quality: number) =>{
    setBack(false);
    try{
      await reviewMutation({variables: {cardId, quality}});
      setIndex(prev => (prev + 1) % cards.length);
    }catch(err: any) {console.error(err);}

  }

  function isDue(dueDate: Date) {
    const now = Date.now();
    return now >= dueDate.getTime();
  }

  let reviewCards = [...cards]
    .map(card => {
      const date = new Date(Number(card.dueDate)); 
      const now = new Date(Number(Date.now()));
      console.log("KKKK: ", now, date);
      return { ...card, dueDate: date };
    })
    .filter((card) => isDue(card.dueDate))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    useEffect(() => {
      console.log("LENGHT: ", reviewCards.length)
    }, [reviewCards.length])
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
 
  if(reviewCards.length === 0){
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
                <h2>{reviewCards[indexC]?.front}</h2>
                <div style={{display: "flex", justifyContent: "center", gap: "5rem"}}>
                  <button onClick={() => setBack(true)}> BACK</button>
                  <button onClick={() => {deleteCard(reviewCards[indexC].id)}}> DELETE </button>
                </div>
            </div> :(
                <div>
                    <p>{reviewCards[indexC]?.back ?? "No back text available"}</p>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '.5rem', justifyContent: 'center' }}>
                      {difficultyMap.map(({ label, quality, color }) => (
                        <button
                          key={label}
                          style={{
                            fontSize: '.8rem',
                            color: color
                          }}
                          onClick={() => handleDifficulty(reviewCards[indexC].id, quality)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                </div>
                )}
        </div>
    </div>
  );
}

export default DeckCard;