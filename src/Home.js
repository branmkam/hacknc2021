import {getAndCheckID, handleFileSelect} from './App';
export default function Home() {
    return <main id = 'main'>
        <p>Have a video or audio recording that's just too long to watch to find one thing?</p>
        <p>Need an easy way to search for wherever your professor talked about that 
            one topic you need to study most? </p>
        <p>Upload a video or audio file below (data will not be collected); every 
            word will be transcribed, and you'll be able to use a search bar 
            to find just what you're looking for!</p>
        <label for="file-input">Upload Your Recording Here!</label>
        <input  onChange={(e) => handleFileSelect(e)} type="file" accept=".mov, .mp4, .mp3, .wav" id="file-input"/>
        <h2 id='msg-upload'></h2>
        <br/>
        <h2>OR</h2>
        <label for="urlentry" id = "urllabel">Search for it online</label>
        <input id = "urlentry" placeholder= "Type URL Here..."/>
        <h2 id = 'msg'></h2>
        <button>
            <p onClick={getAndCheckID}>SUBMIT</p>
        </button>
    </main>   
}