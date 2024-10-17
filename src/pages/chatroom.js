import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { jwtDecode as jwt_decode } from 'jwt-decode';


const SERVER_URL = 'http://localhost:3000'; // Your WebSocket server URL

const Chatroom = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If there's no token, redirect to login
    if (!token) {
      navigate('/login');
      return;
    }

    // Decode the token to get expiration time
    const decodedToken = jwt_decode(token);
    const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds

    // Check if token is expired
    if (Date.now() > expirationTime) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    // Set a timeout to log out the user when the token expires
    const tokenTimeout = setTimeout(() => {
      localStorage.removeItem('token');
      navigate('/login');
    }, expirationTime - Date.now());

    // Initialize the WebSocket connection
    const newSocket = io(SERVER_URL, {
      auth: {
        token: token, // Send the token with the handshake
      },
    });

    // Store the socket connection in state
    setSocket(newSocket);

    // Listen for messages from the server
    newSocket.on('message', (data) => {
      setChatHistory((prevHistory) => [...prevHistory, data]);
    });

    // Listen for updated user list
    newSocket.on('users', (usersList) => {
      setUsers(Object.values(usersList)); // Convert the users object to an array
    });

    // Clean up when the component is unmounted
    return () => {
      clearTimeout(tokenTimeout);
      newSocket.disconnect();
    };
  }, [navigate]);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit('message', { message });
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Chatroom</h2>
      <div style={styles.userList}>
        <h3>Connected Users</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index} style={styles.user}>{user.username}</li>
          ))}
        </ul>
      </div>
      <div style={styles.chatContainer}>
        <div style={styles.chatBox}>
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              style={msg.username === 'You' ? styles.myMessage : styles.theirMessage}
            >
              <strong>{msg.username === 'You' ? 'You' : msg.username}: </strong> {msg.message}
            </div>
          ))}
        </div>
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.button}>Send</button>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#e9eff5',
    padding: '20px',
  },
  header: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
  },
  userList: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    width: '200px',
    height: 'auto',
  },
  user: {
    listStyleType: 'none',
    padding: '8px 0',
    color: '#555',
    fontSize: '16px',
  },
  chatContainer: {
    width: '600px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    height: 'auto',
  },
  chatBox: {
    maxHeight: '400px',
    overflowY: 'scroll',
    padding: '10px',
    marginBottom: '20px',
    backgroundColor: '#f4f4f4',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginRight: '10px',
    fontSize: '16px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#28a745',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  myMessage: {
    backgroundColor: '#d1ffd6',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '20px',
    alignSelf: 'flex-end',
    maxWidth: '60%',
    color: '#333',
    textAlign: 'right',
  },
  theirMessage: {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '20px',
    alignSelf: 'flex-start',
    maxWidth: '60%',
    color: '#333',
    textAlign: 'left',
  },
};

export default Chatroom;
