import './App.css';
import axios from 'axios';

window.most_recent_id = null;
window.status = 'not started';
const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: "532af0971fd34ae2a954649668cf79a1",
    "content-type": "application/json",
  },
});

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

export async function checkIDStaggered() {
  console.log(window.status);
  setInterval(checkID, 5000);
  let end = checkID(window.most_recent_id);
  if(window.status === 'completed'){clearInterval(checkID)}

}

export async function getAndCheckID() {

  let transcript_resp = await assembly
    .post(`/transcript`, {
      audio_url: "https://s3-us-west-2.amazonaws.com/blog.assemblyai.com/audio/8-7-2018-post/7510.mp3"
    })
    .catch((err) => console.error(err));
    
    window.most_recent_id = transcript_resp.data.id;
    console.log('getting new id');

    checkIDStaggered(window.most_recent_id);
}

async function checkID(id) { 

  console.log(id)
  let end_data = await assembly
  .get(`/transcript/${id}`)
  .then((e) => {   
    window.status = e.data.status;
    if(e.data.status === 'completed') {
      console.log(e.data.text);
      let testtext = document.getElementById('testtext');
      testtext.innerHTML = e.data.words.map(word => `${word['text']} ${word['start']/1000}-${word['end']/1000}`).join('\n');
    }
  })
  .catch((err) => console.error(err));
  // window.status = end_data.data.status;
  console.log(window.status);

  return end_data;
}

function App() {
  return (
    <div className="App">
      <p id="testtext">e</p>
      <button onClick={getAndCheckID}>get id</button>
    </div>
  );
}

export default App;
