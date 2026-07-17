import { useState, useEffect } from "react";
import "./App.css";


const API =  "http://localhost:8000";


function App(){


const [username,setUsername]=useState("");

const [email,setEmail]=useState("");

const [password,setPassword]=useState("");



const [isLoggedIn,setIsLoggedIn]=useState(false);



const [file,setFile]=useState(null);

const [jobDescription,setJobDescription]=useState("");

const [result,setResult]=useState(null);

const [loading,setLoading]=useState(false);



const [history,setHistory]=useState([]);

const [hiddenIds,setHiddenIds]=useState([]);




const [message,setMessage]=useState("");

const [chat,setChat]=useState([]);

const [chatLoading,setChatLoading]=useState(false);





// -----------------------------
// CHECK LOGIN ON PAGE LOAD
// -----------------------------

useEffect(()=>{

checkLogin();

},[]);



async function checkLogin(){


try{


const res=await fetch(

`${API}/resumes`,

{

credentials:"include"

}

);



if(res.ok){

setIsLoggedIn(true);

fetchHistory();

}


}

catch(err){

console.log(err);

}


}





// -----------------------------
// SIGNUP
// -----------------------------

async function signup(){


try{


const res=await fetch(

`${API}/signup`,

{

method:"POST",

credentials:"include",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

username,

email,

password

})

}

);



const data=await res.json();


alert(data.message);


}

catch(err){

console.log(err);

alert("Signup failed");

}


}





// -----------------------------
// LOGIN
// -----------------------------


async function login(){


try{


const res=await fetch(

`${API}/login`,

{

method:"POST",

credentials:"include",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

email,

password

})

}

);



const data=await res.json();



if(res.ok){


setIsLoggedIn(true);

fetchHistory();


}

else{

alert(data.message);

}


}


catch(err){

console.log(err);

alert("Login failed");

}


}





// -----------------------------
// LOGOUT
// -----------------------------

async function logout(){


await fetch(

`${API}/logout`,

{

method:"POST",

credentials:"include"

}

);



setIsLoggedIn(false);

setResult(null);

setHistory([]);

setChat([]);

}




// -----------------------------
// HISTORY
// -----------------------------


async function fetchHistory(){


try{


const res=await fetch(

`${API}/resumes`,

{

credentials:"include"

}

);



const data=await res.json();


setHistory(data);


}

catch(err){

console.log(err);

}


}




// -----------------------------
// FILE
// -----------------------------


function handleFileChange(e){

setFile(

e.target.files[0]

);

}




// -----------------------------
// UPLOAD
// -----------------------------


async function uploadResume(){


if(!file){

alert("Select resume");

return;

}



if(!jobDescription.trim()){

alert("Paste job description");

return;

}



setLoading(true);



try{


const formData=new FormData();


formData.append(

"file",

file

);


formData.append(

"job_description",

jobDescription

);




const res=await fetch(

`${API}/upload`,

{

method:"POST",

credentials:"include",

body:formData

}

);



const data=await res.json();


console.log(data);



setResult(data);


fetchHistory();


}

catch(err){

console.log(err);

alert("Upload failed");

}



setLoading(false);


}
// -----------------------------
// CHAT
// -----------------------------

async function sendMessage(){


if(!message.trim())
return;



setChat(prev=>[

...prev,

{
role:"user",
text:message
}

]);



setChatLoading(true);



try{


const res=await fetch(

`${API}/chat`,

{

method:"POST",

credentials:"include",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

resume_text:
result?.resume_text || "",


message:message

})

}

);



const data=await res.json();



setChat(prev=>[

...prev,

{

role:"ai",

text:data.reply || "No response"

}

]);



}

catch(err){


setChat(prev=>[

...prev,

{

role:"ai",

text:"Backend error"

}

]);


}



setMessage("");

setChatLoading(false);


}






// -----------------------------
// HIDE HISTORY
// -----------------------------


function hideResume(id){


setHiddenIds([

...hiddenIds,

id

]);


}



function clearAllHistory(){

setHistory([]);

setHiddenIds([]);

}



const visibleHistory = history.filter(

item=>!hiddenIds.includes(item.id)

);
return (

<div className="main-container">

<div className="card">



{!isLoggedIn && (

<div className="auth-section">


<h2>
Authentication
</h2>



<input

placeholder="Username"

value={username}

onChange={
e=>setUsername(e.target.value)
}

/>



<input

placeholder="Email"

value={email}

onChange={
e=>setEmail(e.target.value)
}

/>



<input

type="password"

placeholder="Password"

value={password}

onChange={
e=>setPassword(e.target.value)
}

/>



<button onClick={signup}>
Signup
</button>



<button onClick={login}>
Login
</button>



</div>

)}







{isLoggedIn && (

<>


<div className="top-bar">


<h1>
AI Resume Analyzer
</h1>



<button onClick={logout}>
Logout
</button>


</div>






<div className="upload-container">


<input

type="file"

onChange={handleFileChange}

/>




<textarea

placeholder="Paste Job Description"

value={jobDescription}

onChange={
e=>setJobDescription(e.target.value)
}

/>



<button onClick={uploadResume}>

Upload Resume

</button>



</div>





{loading &&

<p>
Analyzing Resume...
</p>

}





{result && (

<div className="results-section">


<h2>
ATS Score
</h2>


<h1>

{result.analysis?.resume_score ?? 0}

</h1>



<p>

Semantic Match:

{result.analysis?.semantic_match_score ?? 0}%

</p>





<h3>
Matched Skills
</h3>


<ul>

{

(result.analysis?.matched_skills || [])

.map(

(skill,index)=>(

<li key={index}>
{skill}
</li>

)

)

}

</ul>





<h3>
Missing Skills
</h3>


<ul>

{

(result.analysis?.missing_skills || [])

.map(

(skill,index)=>(

<li key={index}>
{skill}
</li>

)

)

}

</ul>





<h3>
AI Suggestions
</h3>


<p>

{

Array.isArray(result.analysis?.suggestions)

?

result.analysis.suggestions.join(" • ")

:

result.analysis?.suggestions

}

</p>




<div className="chat-container">


<h2>
AI Resume Chat
</h2>



<div className="chat-box">


{

chat.map(

(msg,index)=>(

<div

key={index}

className={
msg.role==="user"
?
"user-msg"
:
"ai-msg"
}

>

{msg.text}

</div>

)

)

}



{chatLoading &&

<div className="ai-msg">

Thinking...

</div>

}


</div>




<input

value={message}

placeholder="Ask AI about resume"

onChange={
e=>setMessage(e.target.value)
}

/>



<button onClick={sendMessage}>

Send

</button>


</div>


</div>

)}






<div className="history-section">


<h2>
Resume History
</h2>



<button onClick={clearAllHistory}>

Clear History

</button>



{

visibleHistory.map(

item=>(

<div

key={item.id}

className="history-card"

>


<p>
{item.filename}
</p>


<p>
Score: {item.score}
</p>



<button

onClick={
()=>hideResume(item.id)
}

>

Remove

</button>



</div>

)

)

}



</div>





</>

)}




</div>

</div>

);


}


export default App;
