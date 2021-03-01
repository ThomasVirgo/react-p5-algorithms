import React, { useEffect, useState } from 'react';
import p5 from 'p5';

const SmartRockets = (props) => {
    let [myP5, setMyP5] = useState(undefined);

    const myRef = React.createRef();

    useEffect(() => {
        if (myP5!=undefined){
            myP5.remove();
            console.log('Removed P5 drawing');
        }
        setMyP5(new p5(Sketch, myRef.current));
        console.log('initalised an instance of a p5 object...');
    
    }, []);


    const Sketch = (p) => { //this function is passed into the p5 constructor 
        let population, cols, rows, grid; 
        let lifespan = 1000;
        let sliderX, sliderY, buttonPause, buttonPlay, buttonAdd, buttonRemove;
        let target = p.createVector(300, 50);
        let count = 0; 
        let cellSize = 20;
        
        const pause = () => {
            p.noLoop();
        }

        const play = () => {
            p.loop();
        }

        const addObstacles = () => {
            for (let i=0; i<rows; i++){
                for (let j=0; j<cols-2; j++){
                    if (p.random()<0.07){
                        grid[i][j] = true;
                    }
                }
            }
        }

        const removeObstacles = () => {
            for (let i=0; i<rows; i++){
                for (let j=0; j<cols; j++){
                    grid[i][j]=false
                }
            }
        }

        p.setup = () => { //called to initalise the sketch
            let xDiv = document.getElementById('x-pos');
            let yDiv = document.getElementById('y-pos');
            let buttonDiv = document.getElementById('pause-play');

            p.createCanvas(600, 600);

            cols = p.width/cellSize;
            rows = p.height/cellSize;

            grid = [];
            for (let i=0; i<=rows; i++){
                grid.push([]);
                for (let j=0; j<=cols; j++){
                    grid[i].push(false);
                }
            }
            console.log('created grid')

            population = new Population();
            console.log('created rocket population')

            sliderX = p.createSlider(0,600,300);
            sliderX.parent(xDiv);

            sliderY = p.createSlider(0,600,50);
            sliderY.parent(yDiv);

            buttonPause = p.createButton('Pause');
            buttonPause.parent(buttonDiv);
            buttonPause.mousePressed(pause);
            buttonPause.addClass('button1');

            buttonPlay = p.createButton('Play');
            buttonPlay.mousePressed(play);
            buttonPlay.parent(buttonDiv);
            buttonPlay.addClass('button1');

            buttonAdd = p.createButton('Add obstacles');
            buttonAdd.addClass('button1');
            buttonAdd.parent(buttonDiv);
            buttonAdd.mousePressed(addObstacles);

            buttonRemove = p.createButton('Remove Obstacles');
            buttonRemove.addClass('button1');
            buttonRemove.parent(buttonDiv);
            buttonRemove.mousePressed(removeObstacles);
            
        }

        p.draw = () => { //called over and over again to re-render drawing
            target.x = sliderX.value();
            target.y = sliderY.value();
            p.background(0);
            p.circle(target.x, target.y, 30);
            population.run();
            count++ 
            let roundComplete = population.rockets.every(rocket => {
                if (rocket.crashed || rocket.success){
                    return true;
                } else {return false};
            })

            for (let i=0; i<rows; i++){
                for (let j=0; j<cols; j++){
                    if (grid[i][j] == true){
                        p.push();
                        p.fill(p.color(238,130,238));
                        p.rect(i*cellSize, j*cellSize, cellSize, cellSize);
                        p.pop(); 
                    }
                }
            }
            
            if (roundComplete){ // calculate the fitness of the rockets and use this to create a new population of rockets
                population = population.evolve();
                count = 0;    
            }

            if (p.mouseIsPressed){
                if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height){
                let rowIdx = Math.floor(p.mouseX/cellSize);
                let colIdx = Math.floor(p.mouseY/cellSize);
                grid[rowIdx][colIdx] = true;
                }
            }
            
            p.mousePressed = () => { // this function is called every time mouse is clicked...
            if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height){
                let rowIdx = Math.floor(p.mouseX/cellSize);
                let colIdx = Math.floor(p.mouseY/cellSize);
                grid[rowIdx][colIdx] = true;
                }
            }
        }

        class Rocket {
            constructor(dna) {
                this.pos = p.createVector(p.width/2, p.height);
                this.vel = p.createVector();
                this.acc = p.createVector();
                this.success = false;
                this.crashed = false;
                this.colIdx = 0; 
                this.rowIdx = 0;

                if (dna){
                    this.dna = dna;
                } else { //no DNA was supplied so create random DNA
                   this.dna = new DNA();  
                }
                
                this.history = [p.createVector(p.width/2, p.height)]; //first entry is the starting position
                this.fitness = 0;
                this.distance = p.dist(target.x, target.y, this.pos.x, this.pos.y);
                }

            calcfitness = () => {
                this.distance = p.dist(this.pos.x, this.pos.y, target.x, target.y);
                this.fitness = 1/this.distance;
                if (this.success == true){
                    this.fitness*=20;
                }
                if (this.obstacleCrash == true){
                    this.fitness/=2;
                }
            }

            applyForce = (force) => {
                this.acc.add(force);
            }

            update = () => {
                this.distance = p.dist(this.pos.x, this.pos.y, target.x, target.y);         
                this.applyForce(this.dna.genes[count]);
                
                this.history.push(p.createVector(this.pos.x, this.pos.y));
                if (this.distance < 15){
                    this.success = true; 
                }
              
                
                
                this.colIdx = Math.floor(this.pos.y/cellSize); 
                this.rowIdx = Math.floor(this.pos.x/cellSize); 
                this.crashed = this.isCrashed();
                
                if (!this.success && !this.crashed){
                    this.vel.add(this.acc);
                    this.pos.add(this.vel);
                    this.acc.mult(0);
                }
                
            }

            isCrashed = () => {
                let x = this.pos.x;
                let y = this.pos.y;
                if (x > p.width || x < 0 || y > p.height || y < 0){
                    return true;
                }
                if (grid[this.rowIdx][this.colIdx] == true){
                    this.obstacleCrash = true;
                    return true;
                }
                else return false
            }

            show = () => {
                p.push(); //surround with push and pop so that features only apply to that section of code..
                p.translate(this.pos.x, this.pos.y);
                p.rotate(this.vel.heading());
                p.rectMode(p.CENTER);
                p.rect(0,0,25,5);
                p.pop();
                p.push();
                for (let i=1; i<this.history.length; i++){
                    let currentPos = this.history[i];
                    let previousPos = this.history[i-1];
                    p.line(previousPos.x, previousPos.y, currentPos.x, currentPos.y);
                    p.stroke('red');  
                }
                p.pop();  
            }
        }

        class Population {
            constructor(genes){
                this.rockets = [];
                this.num = 15;
                this.pool = [];
                this.maxFit = 0;
                this.fitnesses = [];

                if (genes){
                    this.genes = genes;
                    for (let i=0; i<this.num; i++){
                        this.rockets[i] = new Rocket(this.genes[i]);
                    }
                } else { //no genes to pass down yet
                    for (let i=0; i<this.num; i++){
                        this.rockets[i] = new Rocket;
                    }
                }   
            }

            evolve = () => {
                // calculate each rockets fitness and compare to maximum fitness
                for (let i=0; i<this.num; i++){
                    this.rockets[i].calcfitness();
                    if (this.rockets[i].fitness > this.maxFit){
                        this.maxFit = this.rockets[i].fitness;
                    }
                }
                for (let i=0; i<this.num; i++){
                    this.fitnesses.push((this.rockets[i].fitness/this.maxFit)*100)
                }
                // create a pool of genes to pick from, put put a higher number of DNA from rockets with a greater fitness
                for (let i=0; i<this.num; i++){
                    let n = Math.floor(this.fitnesses[i]);
                    for (let j=0; j<=n; j++){
                        this.pool.push(this.rockets[i].dna.genes);   
                    }
                }
                //create a new set of genes for each rocket..
                let newGenes = [];
                for (let i=0; i<this.num; i++){
                    let changeOver = Math.floor(p.random()*lifespan);
                    let randomDNA1 = p.random(this.pool);
                    let randomDNA2 = p.random(this.pool);
                    let currentGenes = [];
                    for (let j=0; j<lifespan; j++){
                        if (j<changeOver){
                            currentGenes[j] = randomDNA1[j];
                        } else {
                            currentGenes[j] = randomDNA2[j];
                        } 
                    }
                    for (let j=0; j<lifespan; j++){
                        if (p.random() < 0.005){
                            currentGenes[j] = p5.Vector.random2D();
                        }
                    }
                    newGenes.push(new DNA(currentGenes));
                }
                const fitnessTotal = this.fitnesses.reduce((a, b) => a + b, 0);
                const avgFitness = (fitnessTotal / this.fitnesses.length);
                //console.log('Average Fitness:', avgFitness);
                return new Population(newGenes);
            }

            run = () =>{ //function to update and show the rocket population
                for (let i=0; i<this.num; i++){
                    let currentRocket = this.rockets[i];
                    currentRocket.update();
                    currentRocket.show();
                }
            }
        }

        class DNA {
            constructor(newDNA){
                this.genes = [];
                if (newDNA){
                    this.genes = newDNA;
                } else {
                   for (let i=0; i<lifespan; i++){
                    this.genes[i] = p5.Vector.random2D();
                    this.genes[i].setMag(0.3); 
                    if (i<=3){
                        this.genes[i].y = p.random()*-1; //such that they all initally take off vertically
                        }  
                    }
                }
            }
        }
    }


    return (
        <div>
           <div id='p5-sketch-one' className='my-canvas' ref={myRef}></div>
           <div id='canvas-inputs' className='canvas-inputs'>
               <div id = 'x-pos'>Target x-position:</div>
               <div id = 'y-pos'>Target y-position:</div>
               <div id = 'pause-play'></div>
           </div>
        </div>
        
    )
}


export default SmartRockets;