const $ = (id) => document.getElementById(id);
const splash = $("splash"), auth = $("auth"), welcome = $("welcome"), ide = $("ide");
let mode = "login", currentUser = null, currentFile = "index.html", activePanel = "terminal", saved = {}, customFiles = {};
const defaults = {
 "index.html": `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello, world!</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="hello">
    <span class="tag">YOUR FIRST PROJECT</span>
    <h1>Hello, <span>world.</span></h1>
    <p>Edit this file, then press Run to preview it.</p>
    <button onclick="document.querySelector('p').textContent='It works! Keep building.'">Click me</button>
  </main>
  <script src="script.js"><\\/script>
</body>
</html>`,
 "style.css": `* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #10131d;
  color: #eef0fa;
  font-family: system-ui, sans-serif;
}
.hello { padding: 2rem; text-align: center; }
.tag { color: #63e6d0; letter-spacing: .16em; font-size: .7rem; }
h1 { font-size: clamp(2.5rem, 8vw, 5rem); letter-spacing: -.06em; }
h1 span { color: #8b7cff; }
p { color: #a0a7ba; }
button { padding: .8rem 1.2rem; border: 0; border-radius: .7rem; background: #8b7cff; color: white; cursor: pointer; }`,
 "script.js": `console.log("Hello from FroskCode!");`,
 "README.md": `# My Project

Welcome to your FroskCode workspace.

- Edit files in the browser
- Press **Run** to preview index.html
- Download the current file with the download button`
};
function show(el){[auth,welcome,ide].forEach(x=>x.classList.add("hidden"));el.classList.remove("hidden")}
function toast(message){const t=$("toast");t.textContent=message;t.classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add("hidden"),2800)}
function setMode(next){mode=next;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));$("submitBtn").querySelector("span").textContent=mode==="login"?"Enter workspace":"Create account";$("password").autocomplete=mode==="login"?"current-password":"new-password";$("error").textContent=""}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
$("togglePassword").addEventListener("click",()=>{$("password").type=$("password").type==="password"?"text":"password"});
function showError(msg){$("error").textContent=msg;$("authForm").classList.remove("shake");void $("authForm").offsetWidth;$("authForm").classList.add("shake")}
$("authForm").addEventListener("submit",async e=>{
 e.preventDefault();$("error").textContent="";
 const name=$("name").value.trim(),password=$("password").value;
 if(!name||!password)return showError("Please enter your name and password.");
 if(mode==="register"&&password.length<6)return showError("Password must be at least 6 characters.");
 const btn=$("submitBtn");btn.disabled=true;btn.querySelector("span").textContent="Please wait…";
 try{
  const response=await fetch(`/api/${mode==="register"?"register":"login"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,password})});
  const data=await response.json();
  if(!response.ok){showError(data.error||"Something went wrong.");return}
  currentUser=data.user;localStorage.setItem("froskcode-session",JSON.stringify({name:currentUser.name}));
  $("welcomeName").textContent=currentUser.name;show(welcome);
 }catch{showError("Can't reach the server. Please check your connection and try again.")}
 finally{btn.disabled=false;btn.querySelector("span").textContent=mode==="login"?"Enter workspace":"Create account"}
});
$("openWorkspace").addEventListener("click",()=>{initWorkspace();show(ide)});
$("logout").addEventListener("click",()=>{currentUser=null;localStorage.removeItem("froskcode-session");show(auth);setMode("login");$("password").value="";toast("You have logged out.")});
function filesNow(){return {...defaults,...customFiles,...saved}}
function iconClass(file){if(file.endsWith(".html"))return "html";if(file.endsWith(".css"))return "css";if(file.endsWith(".js"))return "js";return "md"}
function iconText(file){return file.endsWith(".html")?"◇":file.endsWith(".css")?"▤":file.endsWith(".js")?"◈":"M"}
function renderTree(){
 const tree=document.querySelector(".project-tree");tree.innerHTML='<div class="tree-root">⌄ <span class="folder-icon">▰</span> MY-PROJECT</div>';
 Object.keys(filesNow()).forEach(file=>{const b=document.createElement("button");b.className="file-row"+(file===currentFile?" active":"");b.dataset.file=file;b.innerHTML=`<span class="file-icon ${iconClass(file)}">${iconText(file)}</span> ${file}`;b.addEventListener("click",()=>openFile(file));tree.appendChild(b)});
}
function openFile(file){saveCurrent();currentFile=file;$("activeFileName").textContent=file;$("activeFileIcon").className="file-icon "+iconClass(file);$("activeFileIcon").textContent=iconText(file);$("codeEditor").value=filesNow()[file]??"";$("languageStatus").textContent=file.split(".").pop().toUpperCase();$("unsaved").classList.add("hidden");updateLines();renderTree()}
function saveCurrent(){if(currentFile)saved[currentFile]=$("codeEditor").value}
function updateLines(){const n=$("codeEditor").value.split("\n").length;$("lineNumbers").textContent=Array.from({length:n},(_,i)=>i+1).join("\n");updateCursor()}
function updateCursor(){const el=$("codeEditor"),before=el.value.slice(0,el.selectionStart),line=before.split("\n").length,col=before.length-(before.lastIndexOf("\n")+1)+1;$("cursorStatus").textContent=`Ln ${line}, Col ${col}`}
function initWorkspace(){if(!currentUser)return;Object.keys(defaults).forEach(f=>{if(saved[f]===undefined)saved[f]=defaults[f]});$("userPill").textContent="● "+currentUser.name;renderTree();openFile(currentFile);setPanel("terminal")}
$("codeEditor").addEventListener("input",()=>{saveCurrent();$("unsaved").classList.remove("hidden");updateLines()});
$("codeEditor").addEventListener("click",updateCursor);$("codeEditor").addEventListener("keyup",updateCursor);$("codeEditor").addEventListener("scroll",()=>$("lineNumbers").scrollTop=$("codeEditor").scrollTop);
$("codeEditor").addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const a=e.target.selectionStart,b=e.target.selectionEnd;e.target.setRangeText("  ",a,b,"end");saveCurrent();updateLines();$("unsaved").classList.remove("hidden")}if(e.key==="s"&&(e.ctrlKey||e.metaKey)){e.preventDefault();saveCurrent();$("unsaved").classList.add("hidden");toast("Saved in this browser session.")}});
function setPanel(name){activePanel=name;document.querySelectorAll(".panel-tab").forEach(b=>b.classList.toggle("active",b.dataset.panel===name));const c=$("panelContent");if(name==="terminal")c.innerHTML='<span class="terminal-prompt">➜</span> Workspace ready. Press <b>Run</b> to preview your HTML.';else if(name==="problems")c.textContent="No problems detected by the basic editor.";else c.textContent="Output will appear here when you run your project."}
document.querySelectorAll(".panel-tab").forEach(b=>b.addEventListener("click",()=>setPanel(b.dataset.panel)));
$("clearPanel").addEventListener("click",()=>{$("panelContent").textContent="Panel cleared."});
$("runCode").addEventListener("click",()=>{
 saveCurrent();const files=filesNow();let html=saved["index.html"]||defaults["index.html"];
 const css=saved["style.css"]||defaults["style.css"],js=saved["script.js"]||defaults["script.js"];
 html=html.replace(/<link[^>]+href=["']style\.css["'][^>]*>/i,`<style>${css.replace(/<\/style/gi,"<\\/style")}</style>`);
 html=html.replace(/<script[^>]+src=["']script\.js["'][^>]*><\/script>/i,`<script>${js.replace(/<\/script/gi,"<\\/script")}<\/script>`);
 const blob=new Blob([html],{type:"text/html"}),url=URL.createObjectURL(blob),w=window.open(url,"_blank");
 setPanel("output");$("panelContent").textContent=w?"Preview opened in a new tab.":"Pop-up blocked: allow pop-ups for this site, then press Run again.";if(!w)toast("Your browser blocked the preview pop-up.");
 setTimeout(()=>URL.revokeObjectURL(url),60000);
});
$("downloadFile").addEventListener("click",()=>{saveCurrent();const blob=new Blob([saved[currentFile]??filesNow()[currentFile]??""],{type:"text/plain;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=currentFile;a.click();URL.revokeObjectURL(a.href);$("unsaved").classList.add("hidden")});
$("newFile").addEventListener("click",()=>{const file=prompt("New file name (example: notes.txt):");if(!file)return;if(!/^[\w.-]{1,50}$/.test(file)||file.startsWith(".")){toast("Use a simple file name with letters, numbers, dots, _ or -.");return}if(filesNow()[file]!==undefined){toast("That file already exists.");return}customFiles[file]="";saved[file]="";openFile(file);renderTree()});
$("closeTab").addEventListener("click",()=>toast("The active file stays in your project tree."));
$("searchBtn").addEventListener("click",()=>{const q=prompt("Find text in the current file:");if(!q)return;const at=$("codeEditor").value.indexOf(q);if(at<0){toast("Text not found in this file.");return}$("codeEditor").focus();$("codeEditor").setSelectionRange(at,at+q.length);updateCursor()});
$("settingsBtn").addEventListener("click",()=>toast("Tip: use Ctrl/Cmd + S to save the current file."));
// The splash is intentionally 4 seconds; then the login screen appears.
setTimeout(()=>{splash.classList.add("hidden");show(auth)},4000);
