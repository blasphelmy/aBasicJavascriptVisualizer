function getInputString() {}

function breakIntoComponents(inputString) {
  //this needs more work
  //first, we must first remove all line breaks and whitespace. we also assume that user writes javascript with the use of semi colons...
  inputString = inputString.replace(/\n/g, "");
  inputString = inputString.split(/(;)/g);
  // inputString.match(/[^\;]+\;?|\;/g);
  var outputArray = new Array();

  for (x = 0; x < inputString.length; x++) {
    var temp = inputString[x].split(/([}{])/g);
    for (index = 0; index < temp.length; index++) {
      outputArray.push(temp[index]);
    }
  }
  //we need to do all of this because im terrible with regex.
  outputArray = trimStringInArray(outputArray);
  outputArray = removeEmptyIndices(outputArray);
  outputArray = combineSemiColonsWithPreviousLines(outputArray);
  outputArray = splitIntoTokens(outputArray);
  outputArray = removeEmptyIndices(outputArray);
  return outputArray;
}
function splitIntoTokens(array) { //ONLY USE THIS AFTER INPUT STRING IS COMPLETELY BROKEN DOWN AND CLEANSED.
  var newArray = new Array();
  for (var index = 0; index < array.length; index++) {
    //FOR FUNCTION DECLARATIONS
    if (array[index].match(/(function[ ])/gm)) {
      var temp = array[index].split(/(function[ ])/gm);
      for (var x = 0; x < temp.length; x++) {
        newArray.push(temp[x]);
      }
    }
    //FOR VARIABLE DECLARATIONS
    else if (array[index].match(/(var[ ]*)/gm)) {
      var temp = array[index].split(/(var)[ ]/gm);
      for (var x = 0; x < temp.length; x++) {
        newArray.push(temp[x]);
      }
    } else { //EVERYTHING ELSE SHOULD JUST BE REGULAR STATEMENTS, ei variable declare / redeclaration, function calls,  in theory this method should allow for the addition of if's loops etc...
      newArray.push(array[index]);
    }
  }
  return newArray;
}
function combineSemiColonsWithPreviousLines(array) { //cause i cant figure out how to split by semi colons on the 
  var newArray = new Array();                       //same line. whelps
  for (index = 0; index < array.length; index++) { 
    if (array[index].match(";")) {
      var temp = array[index - 1] + array[index];
      newArray.push(temp);
    } else if (!array[index + 1].match(";")) {
      newArray.push(array[index]);
    }
  }
  return newArray;
}
function trimStringInArray(array) {
  for (index = 0; index < array.length; index++) {
    array[index] = array[index].trim();
  }
  return array;
}
function removeEmptyIndices(array) {
  //clean array if nothing is detected on indexes
  var newArray = new Array();
  for (index = 0; index < array.length; index++) {
    if (!(array[index].trim().length === 0)) {
      newArray.push(array[index]);
    }
  }
  return newArray;
}
function findEOFLine(array, start) {
  //raw string -> breakIntoComponents() first. start is the index of the array where a function declartion is detected.
  var count = 0;
  var endLine = -1;
  for (index = start; index < array.length; index++) {
    if (array[index].search("{") > -1) {
      count = count + 1;
    }
    if (array[index].search("}") > -1) {
      count = count - 1;
    }
    if (count === 0 && array[index].search("}") > -1) {
      endLine = index;
      break;
    }
    // console.log(count);
  }
  return endLine;
}
function returnFunctionStack(array, start, end){ //returns a stack of statements as an array
  var newArray = new Array();
  for(index = start; index <= end; index++){
    newArray.push(array[index]);
  }
  return newArray;
}
function findEOFLine(array, start) {
  //raw string -> breakIntoComponents() first. start is the index of the array where a function declartion is detected.
  var count = 0;
  var endLine = -1;
  for (var x = start; x < array.length; x++) {
    if (array[x].search("{") > -1) {
      count = count + 1;
    }
    if (array[x].search("}") > -1) {
      count = count - 1;
    }
    if (count === 0 && array[x].search("}") > -1) {
      endLine = x;
      break;
    }
    // console.log(count);
  }
  return endLine;
}
function breakExpressionIntoComponents(expression){ //expression should be a string.
  const basicArithmatics =  new RegExp(/([+/*-])/gm);
  var newComponentsArray = expression.split(basicArithmatics);
  return newComponentsArray;
}
function assignExpressionObjects(newComponentsArray){

}