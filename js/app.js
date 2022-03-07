window.addEventListener("load", () => {
  appMain();
});

let runBtn;
let codeEditor;
let exampleInput;
let inputSection;
let inputString;
let instructions;
let globalFrame;
let totalFrames = [];

function appMain() {
  initElements();
  run();

  console.log(instructions);
  console.log(totalFrames);
}

function initElements() {
  // Set elements
  runBtn = document.getElementById("runBtn");
  codeEditor = CodeMirror(document.getElementById("codeEditor"), {
    mode: "javascript",
    theme: "abcdef",
    tabSize: "4",
    lineNumbers: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
    lineWrapping: true,
    lineWiseCutCopy: true,
    autofocus: true,
  });
  exampleInput =
    "var globalNum0 = 0;\nvar globalNum1 = 0;\n\nfunction oneLvlFunc0 () {\n\tvar oneDeepNum0 = 1;\n}\n\nfunction oneLvlFunc1 () {\n\tvar oneDeepNum1 = 1;\n\tfunction twoLvlFunc0 () {\n\t\tvar twoDeepNum0 = 2;\n\t}\n}\n\noneLvlFunc0();\noneLvlFunc1();";
  codeEditor.doc.setValue(exampleInput);

  // Add listeners
  runBtn.addEventListener("click", run, false);
}

function run() {
  inputString = codeEditor.getValue();
  instructions = parseInstructions(inputString);
  createFrames();
}

function parseInstructions(inputString) {
  // Split into lines
  let lines = inputString.split(/\n+/);

  // Trim exterior spaces/tabs
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim();
  }

  // Remove empty lines ("")
  lines = lines.filter((ex) => ex != "");

  // Split lines into 'words' (individual instructions)
  let words = [];
  let delimiters = [" ", "=", ",", ";", "(", ")", "{", "}"];

  lines.forEach((line) => {
    let foot = 0;
    for (let i = 0; i <= line.length; i++) {
      if (
        delimiters.includes(line[i]) ||
        (i == line.length && delimiters.includes(line[foot]))
      ) {
        let word = line.slice(foot, i);
        if (word != " ") words.push(word.trim());
        foot = i;
      }

      // Note: 'i' will go past last index
      // Second if() condition will recognize this situation
      // .slice() will capture the last char if it is a delimiter.
      // Example: slice(16, 17) captures last char of 16 index long line.
    }
  });

  // Remove instructions of empty space. May be redundant at this point
  words = words.filter((word) => word != " ");
  words = words.filter((word) => word != "");

  return words;
}

function createFrames() {
  globalFrame = new Frame("Global");
  let startReadingFrom = 0;
  globalFrame = fillFrame(globalFrame, startReadingFrom);
}

function fillFrame(frame, startReadingFrom) {
  // Where does global frame get pushed to frames?

  for (let i = startReadingFrom; i < instructions.length; i++) {
    // Push frame at closing brace }
    if (instructions[i] == "}") {
      totalFrames.push(frame);
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
      // Check for if function call
      if (instructions[i] == "{") {
        i++;
        frame.children.push(fillFrame(childFrame, i));
        // Increment i until closing bracket, to finish building current frame
        while (instructions[i] != "}" && i < instructions.length) {
          i++;
        }
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
