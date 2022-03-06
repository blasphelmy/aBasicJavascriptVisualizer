window.addEventListener("load", () => {
  appMain();
});

let runBtn;
let inputSection;
let inputString;
let instructions;
let frames = [];

function appMain() {
  initElements();
  run();

  console.log(frames);
}

function initElements() {
  // Get elements
  inputSection = document.getElementById("inputTextArea");
  runBtn = document.getElementById("runBtn");

  // Add listeners
  runBtn.addEventListener("click", run, false);
}

function run() {
  inputString = inputSection.textContent;
  instructions = parseInstructions(inputString);
  createFrames();
}

function parseInstructions(inputString) {
  // Split into lines
  let lines = inputString.split(/\n+/);

  // Trim tabs/exterior spaces
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim();
  }

  // Remove any remaining empty lines ("") from array
  lines = lines.filter((ex) => ex != "");

  // Split expressions into 'words' (individual instructions)
  let words = [];
  let delimiters = [" ", "=", ",", ";", "(", ")", "{", "}"];

  lines.forEach((ex) => {
    let foot = 0;
    for (let i = 0; i < ex.length; i++) {
      if (delimiters.includes(ex[i])) {
        if (foot == i) {
          words.push(ex[i]); // Single char words, like = ; and (
        } else {
          words.push(ex.slice(foot, i));
        }
        foot = i + 1;
      }
    }
  });

  // Remove instructions of empty space
  words = words.filter((word) => word != " ");

  return words;
}

function createFrames() {
  let globalFrame = new Frame("Global");
  let startReadingFrom = 0;
  fillFrame(globalFrame, startReadingFrom);
}

function fillFrame(frame, startReadingFrom) {
  // Where does global frame get pushed to frames?

  for (let i = startReadingFrom; i < instructions.length; i++) {
    // Push frame at closing brace }
    if (instructions[i] == "}") {
      frames.push(frame);
      return frame;
    }

    // Continue if semicolon ;
    if (instructions[i] == ";") {
      i++;
    }

    // Parse Function
    if (instructions[i] == "function") {
      i++;
      let functionName = instructions[i];
      let childFrame = new Frame(functionName); // Id = function name
      childFrame.parent = frame;
      i++;
      if (instructions[i] == "(") i++;
      // Check for parameters
      if (instructions[i] == ")") i++;
      if (instructions[i] == "{") {
        i++;
        frame.children.push(fillFrame(childFrame, i));
      }

      // Skip to closing brace
      while (instructions[i] != "}" || instructions[i] < instructions.length) {
        i++;
      }
    }

    let variableKeywords = ["var", "let", "const"];

    // Parse Variable (In local scope)
    if (variableKeywords.includes(instructions[i])) {
      let newVariable = new Variable(instructions[i]);
      i++;
      newVariable.name = instructions[i];
      i++;
      if (instructions[i] == "=") i++;
      else {
        console.log("Expected assignment");
        return;
      }
      newVariable.value = instructions[i];
      if (instructions[i] == ";") i++;
      frame.variables.push(newVariable);
    }
  }
}

class Variable {
  type;
  name;
  value;

  constructor(type) {
    this.type = type;
  }
}

class Frame {
  id;
  parent;
  variables = [];
  children = [];
  callStack;

  constructor(id) {
    this.id = id;
    this.variables;
    this.children;
  }
}
