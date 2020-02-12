const introductionView = "introduction-view";
const trialView = "trial-view";
const endView = "end-view";
const apiUrl = "https://script.google.com/macros/s/AKfycbzNCSVjLgZCK1gWXxJqd6ylVBFGOo9S7wvAHSVUfdPrj2RSjWA/exec";

const delaySeconds = 3;

const trialsList = [
    {circles:2,squares:1},
    {circles:3,squares:3},
    {circles:4,squares:5},
    {circles:5,squares:3},
    {circles:6,squares:1},
    {circles:6,squares:2},
    {circles:5,squares:1},
    {circles:4,squares:6},
    {circles:3,squares:3},
    {circles:2,squares:1}
]

class Shape{
    constructor(name,x,y){
        this.name = ko.observable(name);
        this.posX = ko.observable(x);
        this.posY = ko.observable(y);
    }
}

function getRandomCoord(){
    return Math.random()*70 + 15;
}

class TrialVm {
    constructor(circlesCount,squaresCount){
        let shapes = [
            ...new Array(circlesCount).fill("circle"),
            ...new Array(squaresCount).fill("square"),
        ]
            
        this.shapes = ko.observableArray(shapes.map(e => new Shape(e,getRandomCoord(),getRandomCoord())));
    }
}

class FormVm {
    constructor (trialsList){
        let rows =  trialsList.map((e,i) => {
          return  {
                index:i,
                value: ko.observable()
            }
        })
        this.trialsList = trialsList.map(e => e.circles);
        this.userName = ko.observable();
        this.rows = ko.observableArray(rows);
        this.isEnabled = ko.observable(true);
    }

    async sendForm(){
        if (!document.querySelector("form").reportValidity()){
            return;
        }

        let testResults = this.rows().map(e => {
            return {
                UserName: this.userName(),
                TrialN: e.index+1,
                Expected: this.trialsList[e.index],
                Selected: Number(e.value()) 
            }
        }); 

        this.isEnabled(false);

        let response = await fetch(apiUrl,
        {
            method: "POST",
            body: JSON.stringify(testResults)
        })

        console.log(testResults);
        alert("Ваши результаты успешно отправлены!");
        
        console.log(response);
    }
}

class TestVM{
    constructor (trialsList){
        this.currentView = ko.observable(introductionView);
        this.trialsList = trialsList;
        this.currentTrialNumber = 0;
        this.currentTrial = ko.observable();
        this.endForm = new FormVm(trialsList);
    }

    startTest(){
        this.currentView(trialView);
        this.showTrial(this);
    }

    showTrial(self){
        console.info(`showing trial ${self.currentTrialNumber}`)
        console.info(self.trialsList[self.currentTrialNumber])

        self.currentTrial(new TrialVm(
            self.trialsList[self.currentTrialNumber].circles, 
            self.trialsList[self.currentTrialNumber].squares
        ));

        self.currentTrialNumber++;
        if (self.currentTrialNumber < self.trialsList.length){
            setTimeout(() => self.showTrial(self),delaySeconds*1000);
        } else {
            self.endTest(self);
        }
    }

    endTest(self){
        self.currentView(endView);
    }
}


let vm = new TestVM(trialsList);


ko.applyBindings(vm);


