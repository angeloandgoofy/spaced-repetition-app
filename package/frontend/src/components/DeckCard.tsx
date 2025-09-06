import { useMutation, useQuery } from '@apollo/client';
import { GET_DECK } from '../graphql/queries';
import { DELETE_CARD, REVIEW_CARD } from "../graphql/mutations";
import { useEffect, useState } from 'react';

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

  let cards = data?.deck?.cards ?? [];

  const [indexC, setIndex] = useState(0);
  const[back, setBack] = useState(false);

  let reviewCards = [...cards]
    .map(card => {
      const date = new Date(Number(card.dueDate)); 
      const now = new Date(Number(Date.now()));
      return { ...card, dueDate: date };
    })
    .filter((card) => card.isDue)
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

  const handleDifficulty = async (cardId: string, quality: number) =>{
    setBack(false);
    try{
      await reviewMutation({variables: {cardId, quality}});
      const remainingCards = reviewCards.filter(c => c.id !== cardId);
      setIndex((prev) => (prev >= remainingCards.length ? 0 : prev));
      await refetch();
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
    { label: "Again", quality: 1, color: "#ef4444"},
    { label: "Hard",  quality: 3, color: "#f97316"},   
    { label: "Good",  quality: 4, color: "#22c55e"}, 
    { label: "Easy",  quality: 5, color: "#3b82f6"},
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading Deck: {error.message}</p>;

  const currentReview = reviewCards[indexC];

  return (
    <div className="deck-card-container">
      <h3>{data?.deck.title}</h3>
        <div className='card-container'>
            {!back ? 
            <div>
                <h2>{currentReview?.front}</h2>
                <div style={{display: "flex", justifyContent: "center", gap: "5rem"}}>
                  <button onClick={() => setBack(true)} disabled={isDeleting}> BACK</button>
                  <button onClick={() => {deleteCard(currentReview.id)}} disabled={isDeleting}> {isDeleting ? 'Deleting' : 'Delete'} </button>
                </div>
            </div> :(
                <div>
                    <p>{currentReview?.back ?? "No back text available"}</p>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '.5rem', justifyContent: 'center' }}>

                      {difficultyMap.map(({ label, quality, color }) => {
                        const preview = currentReview?.reviewPreviews?.find(p => p.quality === quality);
                        
                        return (
                          <button
                            key={label}
                            style={{
                              fontSize: '.8rem',
                              color: color,
                              padding: '8px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              minWidth: '80px'
                            }}
                            onClick={() => handleDifficulty(currentReview.id, quality)}
                            title={preview ? `Next review in: ${preview.intervalText}` : ''}
                          >
                            <span>{label}</span>
                            {preview && (
                              <small style={{ 
                                fontSize: '0.7rem', 
                                opacity: 0.8,
                                marginTop: '2px' 
                              }}>
                                {preview.intervalText}
                              </small>
                            )}
                          </button>
                        );
                      })}
                    </div>
                </div>
                )}
        </div>
    </div>
  );
}

export default DeckCard;