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

let words = null;
let audio_url = null;
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }



export async function checkIDStaggered(id) {
  console.log(window.status);
  let a = function() {checkID(id)}
  setInterval(a, 5000);
}

export async function getAndCheckID() {

  let bigdiv = document.getElementById('bigdiv');
  bigdiv.innerHTML = `<p>Please wait...\nThis could take a few minutes.</p>`;
  let transcript_resp = await assembly
    .post(`/transcript`, {
      audio_url: "https://www.americanrhetoric.com/mp3clips/barackobama/barackobamafederalplaza.mp3"
    })
    .catch((err) => console.error(err));
    
    window.most_recent_id = transcript_resp.data.id;
    console.log('your id:' + window.most_recent_id);

    checkIDStaggered(window.most_recent_id);
}

async function checkID(id) { 

  if(window.status !== 'completed') {
    console.log(window.status);
    let end_data = await assembly
    .get(`/transcript/${id}`)
    .then((e) => {   
      window.status = e.data.status;
      if(e.data.status === 'completed') {
        console.log(e.data.text);
        audio_url = e.data.audio_url;
        console.log(audio_url);
        let bigdiv = document.getElementById('bigdiv');
        bigdiv.innerHTML = `<div id = 'media'>` + checkMedia() + `</div>
        <input id = 'wordsearch' placeholder='Search for a word or phrase...'></input>`+
        `<div id = 'wordtable'></div>`; 
        let wordsearch = document.getElementById('wordsearch');
        wordsearch.onchange = updateSearch;
        words = Array.from(e.data.words);
        displayWordsTable(words);

      }
  })
  .catch((err) => console.error(err));

  return end_data;
}
  return null;
}

function updateSearch()
{
  console.log(document.getElementById('wordsearch').value);
  let inputtext = document.getElementById('wordsearch').value;
  let successWords = [];
  if(words != null && inputtext.length > 0)
   {
      words.forEach(word => word['text'].toLowerCase().includes(inputtext.toLowerCase()) ? successWords.push(word) : 0);
      displayWordsTable(inputtext.length == 0 ? words : successWords);
      
      //update clicks
    }
}

function displayWordsTable(words)
{
   document.getElementById('wordtable').innerHTML = `<table><tr><td>Word</td><td>Time (s)</td></tr>
    ${words.map(word => `<tr><td id = 'word${word['start']}'>${word['text']}</td><td><button id = 'button${word['start']}'>${word['start']/1000}</button></td></tr>`).join('')}
    </table>`;
    let aud = document.getElementById('aud');
    words.forEach(word => document.getElementById('button' + word['start']).onclick = 
    function() {
      aud.currentTime = word['start']/1000;
      aud.play();  
    });
}

// function setAudio(time)
// {
//     let aud = document.getElementById('aud');
//     if(aud != null) 
//     {
//       aud.currentTime = time;
//       aud.play();      
//     }
// }

// function setAudio()
// {
//     let aud = document.getElementById('aud');
//     if(aud != null) 
//     {
//       aud.currentTime = parseFloat(this.value);
//       aud.play();      
//     }
// }

function checkMedia()
{
  let s = '';
    //if(audio_url.substring(-4) == '.mp3') {
    s += `<audio controls id = "aud" src = '${audio_url}'></audio>`;
  //}
  console.log(s);
  return s;
}

function App() {
  return (
    <div className="App">
      <div id="bigdiv"><p>Send your video file here!</p></div>
      <button id = 'thebutton' onClick={getAndCheckID}>get id</button>
    </div>
  );
}

export default App;
