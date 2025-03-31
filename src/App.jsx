import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Landing from './components/Landing'
import axios from 'axios';

function App() {
  const [info, setInfo] = useState([])

  useEffect(() => {
    axios.get('public/data.json')  
      .then(response => {
        setInfo(response.data); 
        console.log(response.data);
      })
      .catch(error => {
        console.log(error); 
      });
  }, [])

  return (   
      <div>
        <Landing data={info}/>
      </div>
       
  
  )
}

export default App
