const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";
// Helper function to convert RGB to HEX
function rgbToHex(rgb) {
  const rgbArray = rgb.match(/\d+/g).map(Number);
  return (
    "#" +
    rgbArray
      .map(x => x.toString(16).padStart(2, "0"))
      .join("")
      .toLowerCase()
  );
}
//tool sound map
const toolSoundMap = {
  brush: "C4", eraser: "D4", rectangle: "E4", circle: "F4", triangle: "G4", line: "A4"
};
//color soundmap
const colorSoundMap = {
  "#ffffff": "C4", //White
  "#000000": "D4", //Black
  "#e02020": "E4", //Red
  "#6dd400": "F4", //Green
  "#4a98f7": "G4", //Blue
  "#ff00ff": "A4"  //colour picker colour
};
//When user clicks a color button
colorBtns.forEach(btn => {
btn.addEventListener("click", () => {
 document.querySelector(".options .selected")?.classList.remove("selected");
btn.classList.add("selected");
const bgColor = window.getComputedStyle(btn).backgroundColor;
const hexColor = rgbToHex(bgColor);
selectedColor = hexColor;
 const note = colorSoundMap[hexColor];
  if (note && synth) {
 synth.triggerAttackRelease(note, "8n");
 } else {
   // Optional fallback sound if color is not mapped
   synth.triggerAttackRelease("B4", "8n");
}
});
});
// Declaring the synths 
let synth, clickSynth, eraseSynth, drawSynth, clearSynth, saveSynth; 
//Track which notes are active for smoother release
let drawNote = "C4";
let isDrawNotePlaying = false;
//Start Tone.js audio after first user interaction
document.body.addEventListener("click", async () => {
 await Tone.start();
console.log("Tone.js audio context started");
synth = new Tone.Synth().toDestination();
 clickSynth = new Tone.MembraneSynth().toDestination();

//Erase Sound
eraseSynth = new Tone.NoiseSynth({
 envelope: { attack: 0.01, decay: 0.3, sustain: 0.2,
//smoother release
release: 1 
},
 volume: -10
}).toDestination();
//Draw: use a smooth sine wave with PolySynth
drawSynth = new Tone.PolySynth(Tone.Synth, {
oscillator: { type: "sine" },
envelope: {
attack: 0.05, decay: 0.2, sustain: 0.5,
release: 1 },
volume: 5
   }).toDestination();
clearSynth = new Tone.MetalSynth({ volume: -15 }).toDestination();
saveSynth = new Tone.Synth({ oscillator: { type: "sine" } }).toDestination();
}, { once: true });
fillSynth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.2 },
    volume: -12
  }).toDestination();

  //fillcheckbox sound effect
  fillColor.addEventListener("change", () => {
 if (fillColor.checked) {
   fillSynth.triggerAttackRelease("C5", "8n"); 
    } else {
  fillSynth.triggerAttackRelease("G4", "8n"); 
    }
  });

//button sound
//const buttonSound = new Audio('sounds/click.mp3'); 
//buttonSound.load();
//Update brush size when slider changes
sizeSlider.addEventListener("input", () => {
brushWidth = sizeSlider.value;
//Play a note based on slider position
  if (synth) {
const sizeValue = parseInt(brushWidth);
//Map slider value to a musical scale 
const notes = [
"C4", "D4",  "E4","F4", "G4", "A4", "B4", "C5"];
const note = notes[Math.min(Math.floor(sizeValue / (100 / notes.length)), notes.length - 1)];
synth.triggerAttackRelease(note, "16n");}
});
//Color selection with sound
colorBtns.forEach(btn => {
btn.addEventListener("click", () => {
document.querySelector(".options .selected")?.classList.remove("selected");
btn.classList.add("selected");
const bgColor = window.getComputedStyle(btn).backgroundColor;
selectedColor = rgbToHex(bgColor);
//Play colour-specific sound
   const note = colorSoundMap[selectedColor];
  if (note && synth) synth.triggerAttackRelease(note, "8n");
});
});
//Custom color picker
colorPicker.addEventListener("change", () => {
selectedColor = colorPicker.value.toLowerCase();
colorBtns[colorBtns.length - 1].style.background = selectedColor;
colorBtns.forEach(btn => btn.classList.remove("selected"));
colorBtns[colorBtns.length - 1].classList.add("selected");
const note = colorSoundMap[selectedColor];
if (note) {
synth.triggerAttackRelease(note, "8n");
} else {
    synth.triggerAttackRelease("A4", "8n"); //custom colors
  }
});
//Track mouse position and start drawing
const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
};
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});
//Drawing functions
//filling colour
const drawRect = (e) => {
    if (!fillColor.checked) {
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);}
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
};
//circle
const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2));
 ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
    toolBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tool.active")?.classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;

    // Play sound for this tool
    const note = toolSoundMap[selectedTool];
    if (note && synth) synth.triggerAttackRelease(note, "8n");
});
});
};
//triangle
const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();};
//Start drawing
const startDraw = (e) => {
 isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
   ctx.fillStyle = selectedColor;
snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (selectedTool === "eraser") {
       eraseSynth?.triggerAttack();
    } else {
    drawSynth?.triggerAttack(drawNote);
    isDrawNotePlaying = true; }};
//Draw while mouse is moving
const drawing = (e) => {
if (!isDrawing) return;
  ctx.putImageData(snapshot, 0, 0);
 if (selectedTool === "brush" || selectedTool === "eraser") {
 ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
  ctx.lineTo(e.offsetX, e.offsetY);
 ctx.stroke();
 } else if (selectedTool === "rectangle") {
drawRect(e);
} else if (selectedTool === "circle") {
 drawCircle(e);
 } else if (selectedTool === "triangle") {
 drawTriangle(e);
    }};
//Stop drawing and release sound
const stopDraw = () => {
    if (!isDrawing) return;
    isDrawing = false;
    if (selectedTool === "eraser") {
    eraseSynth?.triggerRelease();
    } else if (isDrawNotePlaying) {
 drawSynth?.triggerRelease(drawNote);
 isDrawNotePlaying = false; }};
//handle tool selection
toolBtns.forEach(btn => {
 btn.addEventListener("click", () => {
  document.querySelector(".options .active")?.classList.remove("active");
  btn.classList.add("active");
  selectedTool = btn.id;
 const note = toolSoundMap[selectedTool];
if (note && synth) synth.triggerAttackRelease(note, "8n");
  });
});

//Play the button sound
 //buttonSound.currentTime = 0;
 // buttonSound.play();
//Handle brush size
let sliderSynth;
document.body.addEventListener("click", async () => {
await Tone.start();
console.log("Tone.js audio context started");

//Play the button sound
 buttonSound.currentTime = 0;
  buttonSound.play();});
//Handle color selection
colorBtns.forEach(btn => {
btn.addEventListener("click", () => {
document.querySelector(".options .selected")?.classList.remove("selected");
btn.classList.add("selected");
selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");

buttonSound.currentTime = 0;
buttonSound.play();// Play the button sound
  });
});

colorPicker.addEventListener("change", () => {
 colorPicker.parentElement.classList.add("selected");
selectedColor = colorPicker.value;
buttonSound.currentTime = 0;
buttonSound.play();// Play the button sound
});
//Clear canvas
clearCanvas.addEventListener("click", () => {
ctx.clearRect(0, 0, canvas.width, canvas.height);
 setCanvasBackground();
clearSynth?.triggerAttackRelease("16n");
});

//save drawing as image
saveImg.addEventListener("click", () => {
const link = document.createElement("a");
link.download = "drawing.png";
link.href = canvas.toDataURL();
link.click();
saveSynth?.triggerAttackRelease("C5", "8n");
//Play the button sound
    buttonSound.currentTime = 0;
    buttonSound.play();
});
//Sound on title click
document.querySelector("h1")?.addEventListener("click", () => {
  synth?.triggerAttackRelease("C6", "8n");
});
document.querySelector("h2")?.addEventListener("click", () => {
  synth?.triggerAttackRelease("A3", "8n");
});
fillColor.addEventListener("change", () => {
  if (fillSynth) {
  const note = fillColor.checked ? "G3" : "F3"; // Different note for checked/unchecked
  fillSynth.triggerAttackRelease(note, "8n");
  }
});
//Mouse event bindings
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);
