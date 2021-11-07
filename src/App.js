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

  let msg = document.getElementById('msg');
  let urlentry = document.getElementById('urlentry');
  msg.innerHTML = `Please wait...
  This usually takes around 25% of the length of your audio.`;
  if(urlentry.value.trim().length > 0) {
    let transcript_resp = await assembly
      .post(`/transcript`, {
        audio_url: urlentry.value.trim()
      })
      .catch((err) => console.error(err));
    
      if(transcript_resp != (undefined || null)) {
        window.most_recent_id = transcript_resp.data.id;
        console.log('your id:' + window.most_recent_id);

        checkIDStaggered(window.most_recent_id);
      }
      else
      {
        msg.innerHTML = 'invalid URL!'
      }
  }
  else
  {
    msg.innerHTML = `No URL found: using sample speech instead`;
    let transcript_resp = await assembly
    .post(`/transcript`, {
      audio_url: 'https://www.americanrhetoric.com/mp3clips/barackobama/barackobamafederalplaza.mp3'
    })
    .catch((err) => console.error(err));
    
    window.most_recent_id = transcript_resp.data.id;
    console.log('your id:' + window.most_recent_id);

    checkIDStaggered(window.most_recent_id);
    
  }
}


async function checkID(id) { 

  if(window.status !== 'completed') {
    console.log(window.status);
    let end_data = await assembly
    .get(`/transcript/${id}`)
    .then((e) => { 
      console.log(e.data);  
      window.status = e.data.status;
      if(e.data.status === 'completed') {
        console.log(e.data.text);
        audio_url = e.data.audio_url;
        console.log(audio_url);
        let bigdiv = document.getElementById('main');
        bigdiv.innerHTML = `<div class = video-container>

            <p>In the search bar below type the word/phrase you are looking for!</p>
            <audio id="aud" controls>
                <source src = ${audio_url} type = "audio/mp3">
            </audio>
        </div>

        <div class= searchbar-container>
            <form class = "example" action = "add action">
            <button type="submit" id='back'>BACK</button>
                <br/>
                <input id ="wordsearch" type ="text" placeholder="Word/Phrase" name="Search">
            </form> 
            
        </div>

        <div id = 'wordtable' class=table-container>
        </div>`; 
        let wordsearch = document.getElementById('wordsearch');
        wordsearch.onchange = updateSearch;
        words = Array.from(e.data.words);
        //displayWordsTable(words);
      }
      else if(window.status == 'error')
      {
        let msg = document.getElementById('msg');
        msg.innerHTML = 'Error, invalid URL!';
        window.status = 'not started';
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
    ${words.map(word => `<tr><td id = 'word${word['start']}'>${word['text']}</td><td><button id = 'button${word['start']}'>${`${parseInt(word['start']/1000/60)}:${word['start']/1000 % 60 < 10 ? '0' : ''}${Math.round((word['start']/1000 - parseInt(word['start']/1000/60)*60)*100)/100}`}</button></td></tr>`).join('')}
    </table>`;
    let aud = document.getElementById('aud');
    console.log(aud);
    words.forEach(word => document.getElementById('button' + word['start']).onclick = 
    function() {
      aud.currentTime = word['start']/1000 - 0.2;
      aud.play();  
    });
}

async function uploadLocal() {
  document.getElementById('fileinput').addEventListener('change', handleFileSelect, false);
}

function App() {
  return (
    <div className="App">
      <div id="bigdiv"><p>Send your video file here!</p></div>
      <button id = 'thebutton' onClick={getAndCheckID}>get id</button>
      <button id = 'uploadlocal' onClick={uploadLocal}>upload local</button>
      <input type="file" id = 'fileinput'/>
      <p id='fileContent'></p>
    </div>
  );
}

//file select stuff

export function handleFileSelect(event) {
  document.getElementById('msg-upload').innerHTML = 'Uploading file...';
  const reader = new FileReader();
  reader.onload = handleFileLoad;
  let t = reader.readAsArrayBuffer(event.target.files[0]);
}

async function handleFileLoad(event) {
  console.log(event);
  //document.getElementById('fileContent').textContent = event.target.result;
  let upload_url = null;
  let msg = document.getElementById('msg-upload');
  assembly
  //upload file
  .post("/upload", event.target.result)
  .then(
  function(res) {
    console.log(res.data.upload_url); 
    assembly
  .post(`/transcript/`, {audio_url : res.data.upload_url})
    .then((e) => { 
      console.log(e.data);  
      window.status = e.data.status;
      if(e.data.status === 'completed') {
        console.log(e.data.text);
        audio_url = e.data.audio_url;
        console.log(audio_url);
        let bigdiv = document.getElementById('main');
        bigdiv.innerHTML = `<div class = video-container>

            <p>In the search bar below type the word/phrase you are looking for!</p>
            <audio id="aud" controls>
                <source src = ${audio_url} type = "audio/mp3">
            </audio>
        </div>

        <div class= searchbar-container>
            <form class = "example" action = "add action">
            <button type="submit" id='back'>BACK</button>
                <br/>
                <input id ="wordsearch" type ="text" placeholder="Word/Phrase" name="Search">
            </form> 
            
        </div>

        <div id = 'wordtable' class=table-container>
        </div>`; 
        let wordsearch = document.getElementById('wordsearch');
        wordsearch.onchange = updateSearch;
        words = Array.from(e.data.words);
        //displayWordsTable(words);
      }
      else if(window.status == 'error')
      {
        let msg = document.getElementById('msg');
        msg.innerHTML = 'Error, invalid URL!';
        window.status = 'not started';
      }
    })
  })
  .catch((err) => console.error(err));
}

export default App;
