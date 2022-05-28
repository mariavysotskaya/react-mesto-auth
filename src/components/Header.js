import { Link, useLocation } from 'react-router-dom';
import logo from '../images/header/logo.svg';

export default function Header(props) {
  const location = useLocation();

  return (
    <div className="header">
      <a className="link" href="#"><img className="header__logo" src={logo} alt="Логотип" /></a>
      <div className="header__auth">
        {!props.loggedIn && location.pathname === '/sign-up' && <Link className="header__link" to="/sign-in">Войти</Link>}
        {!props.loggedIn && location.pathname === '/sign-in' && <Link className="header__link" to="/sign-up">Регистрация</Link>}
        <p className="header__email">{props.loggedIn && props.email}</p>
        {props.loggedIn && <button className="header__signout-btn button" onClick={props.onSignOut}>Выйти</button>}
      </div>
    </div>
  )
}