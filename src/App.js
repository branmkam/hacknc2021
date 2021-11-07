import './App.css';
import axios from 'axios';
import fs from 'fs';

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
  bigdiv.innerHTML = `<p>Please wait...
  This usually takes around 25% of the length of your audio.
  Do something fun while you're waiting!</p>`;
  let transcript_resp = await assembly
    .post(`/transcript`, {
      audio_url: "https://www.dropbox.com/s/kir1aa53wt6849w/AT_T%20TV%20Commercial%20-%20It_s%20Not%20Complicated%20Infinity%20_2_.mp4"
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
      console.log(e.data);  
      window.status = e.data.status;
      if(e.data.status === 'completed') {
        console.log(e.data.text);
        audio_url = e.data.audio_url;
        console.log(audio_url);
        let bigdiv = document.getElementById('bigdiv');
        bigdiv.innerHTML = `<div id = 'media'>` + checkMedia() + `</div>` + 
        `<div id = 'transcriptid'>Transcript ID (save it to revisit later): tbd</div>`
        `<input id = 'wordsearch' placeholder='Search for a word or phrase...'></input>`+
        `<div id = 'wordtable'></div>`; 
        let wordsearch = document.getElementById('wordsearch');
        wordsearch.onchange = updateSearch;
        words = Array.from(e.data.words);
        //displayWordsTable(words);
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
    words.forEach(word => document.getElementById('button' + word['start']).onclick = 
    function() {
      aud.currentTime = word['start']/1000 - 0.2;
      aud.play();  
    });
}

function checkMedia()
{
  let s = '';
    //if(audio_url.substring(-4) == '.mp3') {
    s += `<audio controls id = "aud" src = '${audio_url}'></audio>`;
  //}
  console.log(s);
  return s;
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

function handleFileSelect(event) {
  const reader = new FileReader();
  reader.onload = handleFileLoad;
  let t = reader.readAsArrayBuffer(event.target.files[0]);
  console.log(t);
}

async function handleFileLoad(event) {
  console.log(event);
  document.getElementById('fileContent').textContent = event.target.result;
  let upload_url = null;
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
        let bigdiv = document.getElementById('bigdiv');
        bigdiv.innerHTML = `<div id = 'media'>` + checkMedia() + `</div>` + 
        `<div id = 'transcriptid'>Transcript ID (save it to revisit later): tbd</div>`
        `<input id = 'wordsearch' placeholder='Search for a word or phrase...'></input>`+
        `<div id = 'wordtable'></div>`; 
        let wordsearch = document.getElementById('wordsearch');
        wordsearch.onchange = updateSearch;
        words = Array.from(e.data.words);
        //displayWordsTable(words);
      }
    })
  })
  .catch((err) => console.error(err));
}

export default App;
