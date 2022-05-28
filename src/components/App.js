import { useState, useEffect } from 'react';
import {Route, Switch, useHistory} from 'react-router-dom';
import api from '../utils/api';
import * as auth from '../utils/auth';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import ProtectedRoute from './ProtectedRoute';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import Login from './Login.js';
import Register from './Register.js';
import InfoTooltip from './InfoTooltip';

export default function App() {
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isActionOK, setIsActionOK] = useState(false);
  const history = useHistory();

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    Promise.all([api.getUser(), api.getCards()])
    .then(([userData, cardsData]) => {
    setCurrentUser(userData);
    setCards(cardsData);
    })
    .catch((err) => alert('Не удалось получить данные'));
  }, []);

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  };

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  };

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  };

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setIsInfoTooltipOpen(false);
    setSelectedCard({});
  };

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  };

  function handleUpdateUser(user) {
    api.editUser(user)
    .then(data => {
      setCurrentUser(data);
      closeAllPopups();
    })
    .catch(err => console.log('Не удалось сохранить изменения'))
  };

  function handleUpdateAvatar(link) {
    api.editUserAvatar(link)
    .then(data => {
      setCurrentUser(data);
      closeAllPopups();
    })
    .catch(err => console.log('Не удалось сохранить изменения'))
  };

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    api.changeLikeCardStatus(card._id, isLiked)
    .then((newCard) => {
      setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
    })
    .catch(err => console.log('Не удалось выполнить действие'));
  };

  function handleCardDelete(card) {
    api.deleteCard(card._id)
    .then(() => {
      setCards(states => states.filter(c => c._id !== card._id))
    })
    .catch(err => console.log('Удаление не удалось'));
  };

  function handleAddPlaceSubmit(data) {
    api.addCard(data)
    .then((card => {
      setCards([card, ...cards]); 
      closeAllPopups();
    }))
    .catch(err => console.log('Не удалось сохранить изменения'))
  };

  function handleRegister(password, email) {
    auth.register(password, email)
    .then(res => {
      if (res.ok) {
        setIsActionOK(true);
        setIsInfoTooltipOpen(true);
        history.push('/sign-in');
      } else {
        setIsActionOK(false);
        setIsInfoTooltipOpen(true);
      }
    })
    .catch((err) => {
      setIsActionOK(false);
      setIsInfoTooltipOpen(true);
    });
  };

  function handleLogin(password, email) {
    auth.login(password, email)
    .then(res => {
      if (res.token) {
        localStorage.setItem('token', res.token);
        setIsLoggedIn(true);
        checkToken();
      } else {
        setIsActionOK(false);
        setIsInfoTooltipOpen(true);
      };
    })
    .catch((err) => {
      console.log(err);
      setIsActionOK(false);
      setIsInfoTooltipOpen(true);
    })
  };

  function handleSignOut() {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    history.push('/sign-in');
  }

  function checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
      auth.checkToken(token)
      .then(res => {
        setIsLoggedIn(true);
        setUserEmail(res.data.email);
        history.push('/');
      })
      .catch(err => {
        return false;
      })
    };
    return false;
  };

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="App">
        <div className="page__container">
          <Header email={userEmail} loggedIn={isLoggedIn} onSignOut={handleSignOut}/>
          <Switch>
            <ProtectedRoute exact path="/" loggedIn={isLoggedIn}>
              <Main
                onEditAvatar={handleEditAvatarClick}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onCardClick={handleCardClick}
                cards={cards}
                onCardLike={handleCardLike}
                onCardDelete={handleCardDelete}
              />
            </ProtectedRoute>
            <Route path="/sign-up">
              <Register onRegister={handleRegister}/>
            </Route>
            <Route path="/sign-in">
              <Login onLogin={handleLogin} />
            </Route>
          </Switch>
          <Footer />
          <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
          <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
          <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit}/>
          <PopupWithForm name="confirm" title="Вы уверены?" buttonText="Да" />
          <ImagePopup card={selectedCard} isOpen={isImagePopupOpen} onClose={closeAllPopups}/>
          <InfoTooltip isOpen={isInfoTooltipOpen} isActionOK={isActionOK} onClose={closeAllPopups} />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
};