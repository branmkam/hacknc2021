import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function App() {
  const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
      authorization: "532af0971fd34ae2a954649668cf79a1",
      "content-type": "application/json",
    },
  });
  
  assembly
    .post(`/transcript`, {
      audio_url: "https://cdn.assemblyai.com/upload/ccbbbfaf-f319-4455-9556-272d48faaf7f"
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err));
  return (
    <div className="App">
      testing
    </div>
  );
}

export default App;
