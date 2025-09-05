import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { GET_DECKS, GET_DECK } from "../graphql/queries";
import { DELETE_DECK, CREATE_DECK, CREATE_CARD } from "../graphql/mutations";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Flashcard from '../components/DeckCard'
import '../styles/dashboard.css'

interface Deck {
  id: string;
  title: string;
  cardCount: number;
}

interface DecksData {
  decks: Deck[];
}

interface CreateDeckForm {
  title: string;
}

interface CreateCardForm {
  front: string;
  back: string;
}

function Dashboard() {
  const client = useApolloClient();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isOpen, setIsopen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string>("");
  const [formErrors, setFormErrors] = useState<string>("");

  const [deckForm, setDeckForm] = useState<CreateDeckForm>({ title: "" });
  const [cardForm, setCardForm] = useState<CreateCardForm>({ front: "", back: "" });

  const { data, error, loading, refetch } = useQuery<DecksData>(GET_DECKS, {
    fetchPolicy: "network-only",
  });

  const [deleteMutation, { loading: deleteLoading }] = useMutation(DELETE_DECK);
  const [createDeck, { loading: createDeckLoading }] = useMutation(CREATE_DECK);

  const [createCard, { loading: createCardLoading }] = useMutation(CREATE_CARD ,{
    refetchQueries: [
      { query: GET_DECK, variables: { id: selectedDeckId } } 
    ],
    awaitRefetchQueries: true 
  });

  const closeIsOpen = () => {
    setIsopen(false);
    setSelectedDeckId(null);
    if (formErrors) setFormErrors("");
  };

  const closeVisible = () => {
    setVisible(false);
    setCardForm({ front: "", back: "" });
    setSelectedDeckId(null);
    if (formErrors) setFormErrors("");
  };

  const handleCreateDeckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeckForm({ ...deckForm, [e.target.name]: e.target.value });
    if (formErrors) setFormErrors("");
  };
  type InputOrTextAreaEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

  const handleCreateCardChange = (e: InputOrTextAreaEvent) => {
    const { name, value } = e.currentTarget;
    setCardForm(prev => ({ ...prev, [name]: value }));
    if (formErrors) setFormErrors("");
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await client.clearStore();
      localStorage.removeItem('token');
      await client.resetStore();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      localStorage.removeItem('token');
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDelete = async (deckId: string) => {
    if (!confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
      return;
    }

    setDeletingDeckId(deckId);
    try {
      await deleteMutation({ variables: { id: deckId } });
      await refetch();
    } catch (err: any) {
      console.error("Error deleting deck:", err);
      setFormErrors("Failed to delete deck. Please try again.");
    } finally {
      setDeletingDeckId("");
    }
  };

  const handleCreateDeck = async () => {
    if (!deckForm.title.trim()) {
      setFormErrors("Deck title is required");
      return;
    }

    try {
      await createDeck({ variables: { title: deckForm.title.trim() } });
      setDeckForm({ title: "" });
      await refetch();
    } catch (err: any) {
      console.error("Error creating deck:", err);
      setFormErrors("Failed to create deck. Please try again.");
    }
  };

  const handleCreateCard = async () => {
    if (!selectedDeckId) return setFormErrors("Please select a deck");
    if (!cardForm.front.trim()) return setFormErrors("Card front is required");
    if (!cardForm.back.trim()) return setFormErrors("Card back is required");

    try {
      await createCard({
        variables: {
          deckId: selectedDeckId,
          front: cardForm.front.trim(),
          back: cardForm.back.trim(),
        },
      });
      setCardForm({ front: "", back: "" });
      closeVisible();
    } catch (err) {
      console.error("Error creating card:", err);
      setFormErrors("Failed to create card. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Loading decks...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>
          <p>Error fetching decks: {error.message}</p>
          <button onClick={() => refetch()}>Try Again</button>
        </div>
      </div>
    );
  }

  const decks = data?.decks || [];

  return (
    <div className="Dashboard-container">
      {/* Header with Logout */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{margin: 0}}>Dashboard</h1>
          <p style={{margin: '0.5rem 0 0 0', color: '#667'}}>
            {decks.length === 0 ? "No decks yet" : `${decks.length} deck${decks.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          style={{
            background: isLoggingOut ? '#9ca3af' : '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem', 
            padding: '0.5rem 1.25rem', 
            fontWeight: 600, 
            cursor: isLoggingOut ? 'not-allowed' : 'pointer', 
            fontSize: '1rem'
          }}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {/* Error Display */}
      {formErrors && (
        <div style={{
          color: '#ef4444',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.25rem',
          padding: '0.75rem',
          marginBottom: '1rem'
        }}>
          {formErrors}
        </div>
      )}

      {/* Create Deck Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Create a New Deck</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            name="title"
            value={deckForm.title}
            placeholder="Enter deck title..."
            onChange={handleCreateDeckChange}
            onKeyDown={(e) => e.key === 'Enter' && !createDeckLoading && handleCreateDeck()}
            disabled={createDeckLoading}
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
              flex: 1
            }}
          />
          <button 
            onClick={handleCreateDeck}
            disabled={createDeckLoading || !deckForm.title.trim()}
            style={{
              background: createDeckLoading || !deckForm.title.trim() ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.5rem 1rem',
              cursor: createDeckLoading || !deckForm.title.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {createDeckLoading ? 'Creating...' : 'Create Deck'}
          </button>
        </div>
      </div>

      {/* Display Decks */}
      <div className="Deck-Display">
        <h2>Your Decks</h2>
        {decks.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#667' 
          }}>
            <p>No decks yet. Create your first deck above!</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {decks.map((deck: Deck) => (
              <li key={deck.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solidrgb(33, 37, 46)',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                backgroundColor: 'gray'
              }}>
                <div>
                  <strong>{deck.title}</strong>
                  <span style={{ color: 'white', marginLeft: '0.5rem'}}>
                    — {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div > 
                  <button onClick={() => {
                    setIsopen(true);
                    setSelectedDeckId(deck.id)
                  }} 
                  style={{
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                  }}>
                    OPEN
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setVisible(true);
                      setSelectedDeckId(deck.id);
                    }}
                    style={{
                      background: '#13ac79ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    ADD CARD
                  </button>
                  <button 
                    onClick={() => handleDelete(deck.id)}
                    disabled={deleteLoading && deletingDeckId === deck.id}
                    style={{
                      background: deleteLoading && deletingDeckId === deck.id ? '#9ca3af' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.75rem',
                      cursor: deleteLoading && deletingDeckId === deck.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {deleteLoading && deletingDeckId === deck.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/*flashcards */}
      {isOpen && (
        <div className="overlay">
          <div className="container" onClick={(e) => e.stopPropagation()}>
          <button 
              className="close-btn" 
              onClick={closeIsOpen}
            >
              &times;
            </button>
            <strong>FlashCards Review</strong>
            <Flashcard deckId={selectedDeckId} />
          </div>
        </div>
      )}

      {/* Card Creation Modal */}
      {visible && (
        <div className="overlay">
          <div className="container" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn" 
              onClick={closeVisible}
            >
              &times;
            </button>
            
            <h3 style={{ marginTop: 0 }}>Create Card</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Front:</label>
              <input
                type="text"
                name="front"
                value={cardForm.front}
                placeholder="Question or prompt..."
                onChange={handleCreateCardChange}
                disabled={createCardLoading}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '0.25rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Back:</label>
              <textarea
                name="back"
                value={cardForm.back}
                placeholder="Answer or explanation..."
                onChange={handleCreateCardChange}
                disabled={createCardLoading}
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '0.25rem',
                  resize: 'vertical',
                }}
              />
            </div>
                        
            <button 
              onClick={handleCreateCard}
              disabled={createCardLoading || !cardForm.front.trim() || !cardForm.back.trim()}
              style={{
                background: createCardLoading || !cardForm.front.trim() || !cardForm.back.trim() ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.75rem 1.5rem',
                cursor: createCardLoading || !cardForm.front.trim() || !cardForm.back.trim() ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              {createCardLoading ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;