import Login from './login';
import Signup from './signup';
import '../styles/home.css';
import { useState } from 'react';

type FormType = 'login' | 'signup' | '';

function Home() {
  const [activeForm, setActiveForm] = useState<FormType>("");

  const closeForm = () => setActiveForm("");
  
  const handleFormSwitch = (formType: FormType) => {
    setActiveForm(formType);
  };

  return (
    <div className="Home-Container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-heading">
          <h1 id="hero-title">Master your flashcards</h1>
          <p className="hero-subtitle">
            Learn through the power of spaced repetition
          </p>
        </div>
        <div className="cta-container">
          <button 
            className='btn-primary' 
            onClick={() => handleFormSwitch('signup')}
          > 
            Sign Up 
          </button>
          <button 
            className='btn-secondary' 
            onClick={() => handleFormSwitch('login')}
          > 
            Login
          </button>
        </div>
        
        {/* Modal Overlay */}
        {activeForm && (
          <div className="overlay" onClick={closeForm}>
            <div className="form-container" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeForm}>&times;</button>
              {activeForm === 'signup' && <Signup />}
              {activeForm === 'login' && <Login />}
            </div>
          </div>
        )}
      </div>

      {/* Features grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon blue"></div>
          <div className="feature-title">Spaced Repetition</div>
          <div className="feature-description">
            Retain information longer with scientifically proven review intervals.
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon purple"></div>
          <div className="feature-title">Fast & Simple</div>
          <div className="feature-description">
            Quickly create, edit, and review flashcards with an intuitive interface.
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-icon green"></div>
          <div className="feature-title">Focused Learning</div>
          <div className="feature-description">
            Target your weak spots and improve efficiently with smart review.
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="footer-cta">
        <h2 className="footer-title">Ready to boost your memory?</h2>
        <p className="footer-subtitle">
          Sign up now and start mastering your flashcards with spaced repetition.
        </p>
        <button 
          className='btn-primary' 
          onClick={() => handleFormSwitch('signup')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Home;