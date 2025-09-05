import { useMutation, useQuery } from '@apollo/client';
import { GET_DECK } from '../graphql/queries';
import { DELETE_CARD, REVIEW_CARD } from "../graphql/mutations";
import { useState } from 'react';

interface ReviewPreview {
  quality: number;
  nextDueDate: string;
  intervalDays: number;
  intervalText: string;
}

interface Card {
  id: string;
  front: string;
  back: string;
  isDue: boolean;
  dueDate: string;
  reviewPreviews: ReviewPreview[];
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

  const [isDeleting, setDeleting] = useState(false);

  const { loading, error, data, refetch } = useQuery<DeckData>(GET_DECK, { 
    variables: { id: deckId }, 
    skip: !deckId
  });
  
   const [deleteMutation] = useMutation(DELETE_CARD, {
    refetchQueries: [{ query: GET_DECK, variables: { id: deckId } }]
  });
  
  const [reviewMutation] = useMutation(REVIEW_CARD, {
    refetchQueries: [{ query: GET_DECK, variables: { id: deckId } }],
  });

  const cards = data?.deck?.cards ?? [];

  const [indexC, setIndex] = useState(0);
  const[back, setBack] = useState(false);

  function isDue(dueDate: Date, threshold = 1){
    const thresholdMS = threshold * 60 * 1000;

    const now = Date.now();
    const dueTime = dueDate.getTime();

    const diffMs = dueTime - now;

    return diffMs <= thresholdMS; 
  }

  let reviewCards = [...cards]
    .map(card => {
      const date = new Date(Number(card.dueDate)); 
      const now = new Date(Number(Date.now()));

      
      return { ...card, dueDate: date };
    })
    .filter((card) => isDue(card.dueDate))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const deleteCard = async (cardId: string)=> {
    if (!confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
      return;
    }
  
    setDeleting(true);

    try{
      await deleteMutation({variables: {id: cardId}});          
      await refetch();
    }catch(err: any){
      console.error("Error deleting card: ", err);
    }finally{
      setDeleting(false);
    }
  }

  /**fix bug index */
   const handleDifficulty = async (cardId: string, quality: number) =>{
      setBack(false);
      try{
        await reviewMutation({variables: {cardId, quality}});
        const remainingCards = reviewCards.filter(c => c.id !== cardId);
        
        setIndex((prev) =>{
          return (prev + 1) % remainingCards.length});
      }catch(err: any) {console.error(err);}
    }

  if(reviewCards.length === 0){
    return (
      <div>
          <p>No cards available</p>
      </div>
    )
  }

  const difficultyMap = [
    { label: "Again", quality: 1, color: "#ef4444",},
    { label: "Hard",  quality: 3, color: "#f97316"},   
    { label: "Good",  quality: 4, color: "#22c55e"}, 
    { label: "Easy",  quality: 5, color: "#3b82f6"},
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading Deck: {error.message}</p>;

  const currentReview = reviewCards[indexC];

  console.log("THIS IS CURRENTREVIEW: ", currentReview, indexC);

  return (
    <div className="deck-card-container">
      <h3>{data?.deck.title}</h3>
        <div className='card-container'>
            {!back ? 
            <div>
                <h2>{currentReview?.front}</h2>
                <div style={{display: "flex", justifyContent: "center", gap: "5rem"}}>
                  <button onClick={() => setBack(true)} disabled={isDeleting}> BACK</button>
                  <button onClick={() => {deleteCard(reviewCards[indexC].id)}} disabled={isDeleting}> {isDeleting ? 'Deleting' : 'Delete'} </button>
                </div>
            </div> :(
                <div>
                    <p>{currentReview?.back ?? "No back text available"}</p>
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