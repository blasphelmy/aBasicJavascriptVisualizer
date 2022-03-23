var errorDetected = false;
var editor = null;
var outPutEditor = null;
var count = 1;
var consoleline = 1;
const defaultDelay = 250;
function initParse() {
  //console.clear();
  document.getElementById("mainFrameContainer").innerHTML = "";
  document.getElementById("console").innerHTML = "";
  errorDetected = false;
  count = 1;
  consoleline = 1;
  //step 1, we get javascript code from user as a raw string.
  var inputString = editor.getValue() + ";";
  //now we split the inputString into its induvidual components
  var CallStack = breakIntoComponents(inputString);
  outPutCallStacktoCodeEditor(CallStack);
  var newFunctionDefArray = new Array();
  newFunctionDefArray.push("Global");
  newFunctionDefArray.push(new Array());
  var newFunction = new functionDEF(newFunctionDefArray, 0, CallStack.length);
  var FinalFrame = interpretCallStack(CallStack, new frame(newFunction, CallStack.length, count));
  console.log(FinalFrame);
}
function interpretCallStack(array, Frame) {
  
  var elementFrame = null;
  if(typeof(Frame.previousNodeFrame) === "undefined"){ //dont check if id is global. check if it is the root of the tree.
    elementFrame = document.querySelector("#mainFrameContainer");
    elementFrame.classList.add("fade-in");
  }else{
    elementFrame = document.getElementById(Frame.previousNodeFrame.id + Frame.previousNodeFrame.fIndex + "ChildrenFrames");
    setTimeout(() => {
      elementFrame.classList.remove("hide");
      elementFrame.classList.add("show", "fade-in");
    }, count * defaultDelay);
    count++;
  }
  createNewFrameElements(elementFrame, Frame);
  
  for (var index = Frame.start; index <= Frame.end && errorDetected === false; index++) {
   //console.log("index ", index);
    //DETECT FUNCTION DECLATION TOKEN 
    //nothing fancy, just regex and more regex
    if (isFunctionDeclarion(array[index])) {
     index = functionDeclaredHandler(index, array, Frame);
      //DETECT VARIABLE DECLATION TOKEN
    } else if (isVarDeclartion(array[index])) {
      index = variableDeclarationHandler(index, array, Frame);
      //DETECT VARIABLE REASSIGNMENT
    }else if(detectStatementVariableReassignment(array[index])){
      variableReassignmentHandler(index, array, Frame);
    }
    else if(detectConsoleLog(array[index])){
      if(array[index].match(/(^console)+([ ]*)+[.]/)){
        consoleLoghandler(index, array, Frame); 
      }else{
        addConsoleLine("syntax error on line " + index);
        errorDetected = true;
      }
    }
    else if(detectFunctionCalls(array[index])){
      functionCallHandler(array, index, Frame);
    }
    else if(new RegExp(/(return+[ ])/gm).test(array[index])){
      return returnHandler(array, index, Frame);
    }else if(!(new RegExp(/(['}{'])/gm).test(array[index])) && index < array.length-1){
      addConsoleLine("error: on line " + index);
      errorDetected = true;
      return;
    }
  }
  if(Frame.id === "Global"){
    return Frame;
  }
}