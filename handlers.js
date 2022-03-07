function functionDeclaredHandler(index, array, Frame){
  var start = index;
  var end = findEOFLine(array, index);
  
  var element = document.getElementById(Frame.id + Frame.fIndex + "FunctionDef");
  var newFunctionDeclarationElement = document.createElement("p");
  newFunctionDeclarationElement.innerText = "FUNCTIONDEF: " + array[index+1] + "  { start: " + start + "; end: " + end + " }";
  element.appendChild(newFunctionDeclarationElement);

  //console.log(newFunctionDeclarationElement);

  var newFunction = new functionDEF(array[index+ 1], start+2, end);
  //console.log(newFunction);
  Frame.addFunctionDefinition(newFunction);
  return end;
}
function variableDeclarationHandler(index, array, Frame){
  //console.log("is variable declartion at index: " + index);
  var keyValuePair = array[index+1].split("=");
  keyValuePair[0] = keyValuePair[0].trim();

  var variableName = keyValuePair[0];
  var expression = keyValuePair[1];
  console.log(keyValuePair);
  expression = breakExpressionIntoComponents(expression);
  // console.log(expression);
  var newVarible = new variable(keyValuePair[0], eval(keyValuePair[1])); //cheater!
  Frame.addVariables(newVarible);
  appendVariablesToVisulizer(Frame);
  index++;
  return index;
}
function appendVariablesToVisulizer(Frame){
  var frameVariables = Frame.variables;
  var element = document.getElementById(Frame.id + Frame.fIndex + "variables");
  element.innerHTML = "";

  var newElementChild = document.createElement("p");
  newElementChild.innerHTML = "Active Variables :";

  element.appendChild(newElementChild);

  console.log(element);  
  for (const [key, value] of frameVariables.entries()) {
    var newElementChild = document.createElement("p");
    newElementChild.innerHTML = "{ name: " + key + " value: " + value + " }";
    element.appendChild(newElementChild);
  }
}