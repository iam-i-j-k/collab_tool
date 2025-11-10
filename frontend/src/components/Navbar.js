import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Settings, LogOut, User } from "lucide-react";
import "./navbar.css";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setUser]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const getAvatarGradient = (name) => {
    if (!name) return "linear-gradient(45deg, #6366f1, #8b5cf6)";
    const charCode = name.charCodeAt(0);
    const hue1 = (charCode * 7) % 360;
    const hue2 = (hue1 + 60) % 360;
    return `linear-gradient(45deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 60%))`;
  };

  const getAvatarContent = (user) => {
    if (user?.profileImage) {
      return (
        <img 
          src={`${process.env.REACT_APP_URL}${user.profileImage}`}
          alt={user.name}
          className="avatar-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
      );
    }
    return <span>{user?.name?.charAt(0).toUpperCase()}</span>;
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">C</span>
            <span className="brand-text">CollabTool</span>
          </Link>
            <div className={`navbar-menu ${menuOpen ? "active" : ""}`}>
            <ul className="navbar-nav">
                <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                    Dashboard
                </Link>
                </li>
            </ul>
            </div>
        </div>


        <div className="navbar-right">
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="avatar-button"
                onClick={toggleDropdown}
                style={{ background: getAvatarGradient(user.name) }}
              >
                {getAvatarContent(user)}
              </button>

              <div className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
                <div className="dropdown-header">
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                </div>

                <div className="dropdown-divider"></div>

                <ul className="dropdown-list">
                  <li className="dropdown-item">
                    <Link to="/settings" className="dropdown-link">
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <button className="dropdown-link logout-button" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/register" className="register-button">
                Register
              </Link>
            </div>
          )}

          <button className="menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
