//**important notes: on a function call you will always need to initialize a the corrosponding frame... how?
class frame {
    Globalobjects;
    //a frame may contain variables, functionDEF....or...maybe a callStack...
    id; //name
    fIndex; //this tracks something...im not sure yet
    variables; //is an map [key, value] = [variablename, value]
    functionDefinitions; //is an map ....//[functionName, functionDefinition {start, end}]
    childrenFrames;
    previousNodeFrame;
    returnToIndex;
    start;
    end;
    constructor(aFunctionDefinition, index, count) {
      this.variables = new Map();
      this.functionDefinitions = new Map();
      this.childrenFrames = new Array();
      this.id = aFunctionDefinition.getName();
      this.returnToIndex = index + 1;
      this.start = aFunctionDefinition.getStart();
      this.end = aFunctionDefinition.getEnd();
      this.fIndex = count;
    }
    addVariables(variable) {
      //accepts an object of variable type
      // this.variables.push([variable.name,variable.value]);
      this.variables.set(variable.name, variable.value);
    }
    addFunctionDefinition(newFunction) {
      //whenever you add a function (through encountering a function declaration token within this frame's context)
      this.functionDefinitions.set(newFunction.name, newFunction);
    }
    addChildFrame(childFrame){
      this.childrenFrames.push(childFrame);
    }
    addStatements(statementStack) {
      //is an object of statementStack
      this.callStack.push(statementStack);
    }
    returnFunctionDefinitions(functionCall) {
      var newCall = functionCall.split(";");
      return this.functionDefinitions.get(newCall[0]);
    }
    returnParentFrame() {
      return this.previousNodeFrame;
    }
    peak(){
      return this;
    }
    setDefaultGlobalObjects(objectsArray){
      
    }
    get returnPreviousFrame(){
      return this.previousNodeFrame;
    }
    get returnToIndex(){
      return parseInt(this.returnToIndex);
    }
  }
  class functionDEF {
    name; //what is your name
    inputParamenters; //array
    start; //index of array
    end; //end of array...
    constructor(newFunctionDefArray, start, end) {
      this.name = newFunctionDefArray[0];
      this.inputParamenters = newFunctionDefArray[1];
      this.start = start;
      this.end = end;
    }
    getStart(){
      return parseInt(this.start);
    }
    getEnd(){
      return parseInt(this.end);
    }
    getName(){
      return this.name;
    }
  }
  class statementStack {
    size; //size of this stack
    statementHead; //always points back to the original head of this stack
    statementTail; //always points to the tail of this stack
    constructor() {
      //of a variable declartion, //function declarations/calls, variable name, valid pointers to objects basically.
      this.statementHead = null;
      this.statementTail = null;
      this.size = 0;
    }
    addNode(newNode) {
      //lets imagine the first
      if (this.statementHead === null) {
        this.statementHead = newNode;
      } else if (this.statementTail === null) {
        this.statementTail = newNode;
        this.statementTail.previousNode = this.statementHead;
        this.statementHead.nextNode = this.statementTail;
      } else {
        this.statementTail.nextNode = newNode;
        newNode.previousNode = this.statementTail;
        this.statementTail = newNode;
      }
      this.size++;
    }
    pop(index) {
      //if user provides no index input it pops the tail and returns it...
      console.log(index);
    }
    getStackNodeIndexOf(index) {
      var newStatementStack = null;
      var counter = 0;
      var temp = this.statementHead;
      // console.log(this);
      while (temp.nextNode != undefined) {
        temp = temp.nextNode;
        if (counter === index) {
          return temp;
        }
        counter++;
      }
      return "error";
    }
  }
  class variable {
    type; //int, float, double, String is type even needed in javascript?? for simplicity's sake, please lets just get rid of types and only use strings.
    name; //what is your name?
    value; //what value do you store?
    nextNode; //next command.
    previousNode; //points to previous statement...?
    constructor(name, value) {
      //the minimum you need to declare a variable
      this.name = name;
      this.value = value;
    }
  }
  class value {
    value; //what is your value? a string? integer? float? i guess we could use javascript's amazingly flexible handling of types here...
    previousNode; //points to an arithmatic operation or to a variable...
    nextNode; //next node. a number sitting next to each other never makes sense. so a number have to be lead by and folowed by some sort of arithmatic
    constructor(value) {
      this.value = value;
    }
    addNode(newNode) {
      newNode.previousNode = this;
      this.nextNode = newNode;
    }
  }
  class equal {
    name;
    previousNode; //points to an object of either value() or variable();
    nextNode; //same here
    constructor() {
      this.name = "=";
    }
    eval() {
      this.previousNode.value = this.nextNode.value;
    }
  }
  class multiply {
    name;
    previousNode; //points to an object of either value() or variable();
    nextNode; //same here
    constructor() {
      this.name = "*";
    }
  }
  class add {
    name;
    constructor() {
      this.name = "+";
    }
  }
  class subtract {
    name;
    constructor() {
      this.name = "-";
    }
    eval() {
      return this.previousNode.value - this.nextNode.value;
    }
  }
  class divide {
    name;
    constructor() {
      this.name = "/";
    }
  }