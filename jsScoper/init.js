var errorDetected = false;
var editor = null;
var outPutEditor = null;
var count = 1;
var consoleline = 1;
var defaultDelay = 250;
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

      var functionCallBreakdown = extractFunctionParameters(array[index]);
      console.log(functionCallBreakdown);
      var originFrame = returnFrameContainingFunctionDEF(Frame, functionCallBreakdown[0]);
      if(originFrame.returnFunctionDefinitions(functionCallBreakdown[0])){
        var newFunctionDef = originFrame.returnFunctionDefinitions(functionCallBreakdown[0]);
        var newFrame = new frame(newFunctionDef, index, count);
        if(newFunctionDef.inputParamenters != ''){
          for(var i = 0; i < newFunctionDef.inputParamenters.length; i++){
            functionCallBreakdown[1][i] = eval(evalExpression(functionCallBreakdown[1][i], Frame, index));
            newFrame.variables.set(newFunctionDef.inputParamenters[i], functionCallBreakdown[1][i]);
          }
        }
        newFrame.previousNodeFrame = originFrame;
        originFrame.addChildFrame(newFrame);
        interpretCallStack(array, newFrame);
      }
      else{
        addConsoleLine("error: on line " + index + " function definition doesn't exist!");
        errorDetected = true;
        return;
      }
    }
    else if(new RegExp(/(return+[ ])/gm).test(array[index])){
      returnHandler(array, index, Frame);
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
function returnHandler(array, index, Frame){
  var newArray = array[index].split(/(return+[ ]*)/);
  newArray = removeEmptyIndices(newArray);
  newArray = trimStringInArray(newArray);
  
  var expression = newArray[1].split(";");
  var expression = evalExpression(expression[0], Frame, index);
  console.log("return equals = " + eval(expression));

}
function extractFunctionParameters(newString){ //abc(x,y,x), returns an array[abc(), array[x,y,z]]
  var newArray = new Array();
  newString = newString.split(/[)(]/);
  newArray.push(newString[0].trim() + "()");
  newString = newString[1].split(',');
  newString = trimStringInArray(newString);
  newArray.push(newString);
  return newArray;
}